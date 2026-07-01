import Donor from "../models/donorModel.js";
import Request from "../models/requestModel.js";
import bcrypt from "bcryptjs";
import axios from "axios";
import Receiver from "../models/receiverModel.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import expiryQueue from "../queues/expiryQueue.js";
import cloudinary from "../config/cloudinaryConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const editDonorProfile = async (req, res) => {
  try {
    const { id } = req.user; // Only need ID
    const donor = await Donor.findById(id);

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }
    if (req.body.name) donor.name = req.body.name;
    if (req.body.phoneNumber) donor.phoneNumber = req.body.phoneNumber;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      donor.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedDonor = await donor.save();

    res.status(200).json({
      message: "Donor profile updated successfully",
      donor: updatedDonor,
    });
  } catch (error) {
    console.error("Error updating donor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const donorRequest = async (req, res) => {
  console.log("Donation request received");
  try {
    const {
      donationType,
      foodType,
      approxPeople,
      clothesType,
      size,
      condition,
      quantity,
      ageGroup,
      title,
      author,
      location,
      expiryTime,
    } = req.body;
    console.log(req.body);

    const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;
    if (!OPENCAGE_API_KEY) {
      console.error("Missing OPENCAGE_API_KEY environment variable");
      return res.status(500).json({
        message: "Server misconfiguration: OPENCAGE_API_KEY missing",
      });
    }

    let geoRes;
    try {
      geoRes = await axios.get(
        "https://api.opencagedata.com/geocode/v1/json",
        {
          params: {
            key: OPENCAGE_API_KEY,
            q: location,
            limit: 1,
          },
        }
      );
    } catch (geoError) {
      console.error("Geocoding error:", {
        message: geoError.message,
        status: geoError.response?.status,
        data: geoError.response?.data,
      });
      return res.status(500).json({
        message: "Geocode service unavailable",
        error: geoError.response?.data || geoError.message,
      });
    }

    console.log(geoRes);
    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      console.error("Geocoding returned no results for location:", location);
      return res.status(400).json({ message: "Could not geocode address" });
    }

    const { lat, lng } = geoRes.data.results[0].geometry;

    console.log("Coordinates:", { lat, lng });

    // If multer provided a file buffer, upload it to Cloudinary and use returned URL
    let imageUrl = "";
    if (req.file && req.file.buffer) {
      try {
        const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          folder: "foodgift_requests",
          resource_type: "image",
        });
        imageUrl = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
      }
    }

    let matched_ngos = [];
    let mlUnavailable = false;
    
    // Only call ML service for food donations
    if (donationType === "food") {
      try {
        const mlServiceUrl = process.env.ML_SERVICE_URL || "https://foodgift-ml.onrender.com/predict-urgency";
        const requestData = {
          food_type: foodType,
          quantity: approxPeople,
          expiry_time: expiryTime,
          location: {
            lat: parseFloat(lat),
            lon: parseFloat(lng),
          },
        };

        console.log("Sending to ML service:", requestData);

        const mlResponse = await axios.post(mlServiceUrl, requestData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 30000,
        });
        console.log("ML service response status:", mlResponse.status);
        console.log("ML service response data:", mlResponse.data);

        if (mlResponse.data && Array.isArray(mlResponse.data.matched_ngos)) {
          matched_ngos = mlResponse.data.matched_ngos;
        } else {
          console.warn("ML service returned unexpected response. Using local fallback.", mlResponse.data);
        }
      } catch (mlError) {
        mlUnavailable = true;
        console.error("ML Service Error Details:", {
          message: mlError.message,
          status: mlError.response?.status,
          statusText: mlError.response?.statusText,
          data: mlError.response?.data,
          url: mlError.config?.url,
        });

        if (mlError.response?.data && typeof mlError.response.data === 'string' &&
          mlError.response.data.includes('<html>')) {
          console.error("ML service returned HTML instead of JSON - service might be down or misconfigured");
        }
        console.warn("Continuing with donation submission using local receiver matching fallback.");
      }
    }

    // Create donation request with flexible fields based on type
    const requestPayload = {
      donor: req.user.id,
      donationType: donationType || "food",
      location: {
        address: location,
        latitude: lat,
        longitude: lng,
      },
      expiryTime,
      status: "pending",
      imageUrl: imageUrl || "",
    };

    // Add type-specific fields
    if (donationType === "food") {
      requestPayload.foodType = foodType;
      requestPayload.approxPeople = approxPeople;
    } else if (donationType === "clothes") {
      requestPayload.clothesType = clothesType;
      requestPayload.size = size;
      requestPayload.condition = condition;
      requestPayload.quantity = quantity;
    } else if (donationType === "toys") {
      requestPayload.condition = condition;
      requestPayload.ageGroup = ageGroup;
      requestPayload.quantity = quantity;
    } else if (donationType === "books") {
      requestPayload.title = title;
      requestPayload.author = author;
      requestPayload.quantity = quantity;
      requestPayload.condition = condition;
    }

    const newRequest = new Request(requestPayload);
    await newRequest.save();

    // Enqueue a delayed job to mark this request expired at `expiryTime`
    try {
      const exp = new Date(newRequest.expiryTime).getTime();
      let delay = exp - Date.now();
      if (delay < 0) delay = 0;
      await expiryQueue.add("expire-request", { requestId: newRequest._id.toString() }, { delay, removeOnComplete: true, attempts: 3 });
    } catch (queueErr) {
      console.error("Failed to enqueue expiry job:", queueErr);
    }

    const distanceKm = (lat1, lon1, lat2, lon2) => {
      const toRad = (value) => (value * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const receivers = await Receiver.find({
      $or: [
        { "location.latitude": { $exists: true } },
        { "location.lattitude": { $exists: true } },
      ],
      "location.longitude": { $exists: true },
    });

    const assignedNgos = [];

    for (const dbNgo of receivers) {
      const receiverLat = parseFloat(dbNgo.location.latitude || dbNgo.location.lattitude);
      const receiverLng = parseFloat(dbNgo.location.longitude);
      if (Number.isNaN(receiverLat) || Number.isNaN(receiverLng)) {
        continue;
      }

      const distance = distanceKm(lat, lng, receiverLat, receiverLng);
      if (distance <= 15) {
        try {
          if (!dbNgo.requests) dbNgo.requests = [];
          dbNgo.requests.push(newRequest._id);
          await dbNgo.save();
          assignedNgos.push(dbNgo.name);
          console.log(`Request assigned to nearby receiver: ${dbNgo.name} (${distance.toFixed(2)} km)`);
        } catch (assignError) {
          console.error(`Error assigning request to receiver ${dbNgo.name}:`, assignError);
        }
      }
    }

    if (assignedNgos.length === 0) {
      console.warn("No receivers found within 15 km. Falling back to top ML-based receivers.");
      const parseNgoName = (ngo) => {
        if (!ngo) return null;
        if (typeof ngo === "string") return ngo;
        return ngo.name || ngo.organization || ngo.orgName || null;
      };

      const top3Names = matched_ngos
        .map(parseNgoName)
        .filter(Boolean)
        .slice(0, 3);

      for (const ngoName of top3Names) {
        try {
          const dbNgo = await Receiver.findOne({ name: ngoName });
          if (dbNgo) {
            if (!dbNgo.requests) dbNgo.requests = [];
            dbNgo.requests.push(newRequest._id);
            await dbNgo.save();
            assignedNgos.push(dbNgo.name);
            console.log(`Fallback assigned request to: ${dbNgo.name}`);
          } else {
            console.warn(`Fallback NGO not found in database: ${ngoName}`);
          }
        } catch (ngoError) {
          console.error(`Error fallback assigning to NGO ${ngoName}:`, ngoError);
        }
      }
    }

    res.status(201).json({
      message: mlUnavailable
        ? "Request created successfully, but ML matching is currently unavailable. Local matching fallback was used."
        : "Request created successfully",
      request: newRequest,
      matched_ngos,
      assigned_ngos: assignedNgos,
      mlUnavailable,
    });

  } catch (error) {
    console.error("Error creating request:", error);

    res.status(500).json({
      message: "Server error",
      error: {
        name: error.name,
        message: error.message,
      },
    });
  }
};
export const cancelDonationRequest = async (req, res) => {
  const { requestId } = req.params;
  const donorId = req.user.id;

  try {
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Donation request not found" });
    }

    if (request.donor.toString() !== donorId) {
      return res.status(403).json({ message: "You can only cancel your own requests" });
    }

    if (["accepted", "collected", "expired", "cancelled"].includes(request.status)) {
      return res.status(400).json({
        message: `This request cannot be cancelled because it is already ${request.status}`,
      });
    }

    request.status = "cancelled";
    await request.save();

    await Receiver.updateMany(
      { requests: requestId },
      { $pull: { requests: requestId } }
    );

    res.status(200).json({
      message: "Donation request cancelled successfully",
      request,
    });
  } catch (error) {
    console.error("Error cancelling donation request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getDonorRequests = async (req, res) => {
  const { id } = req.user;
  try {
    // Fallback: ensure any requests that already passed expiryTime are marked expired
    try {
      await Request.updateMany({ status: { $ne: "expired" }, expiryTime: { $lte: new Date() } }, { $set: { status: "expired" } });
    } catch (updateErr) {
      console.error("Error updating expired requests on read:", updateErr);
    }
    const requests = await Request.find({ donor: id }).populate(
      "donor",
      "name phoneNumber email"
    );
    // Sort by most recent first, showing both active and expired requests
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getDonorProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const donor = await Donor.findById(id).select("-password");

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    res.status(200).json({ donor });
  } catch (error) {
    console.error("Error fetching donor profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
