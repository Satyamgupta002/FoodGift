import Donor from "../models/donorModel.js";
import Request from "../models/requestModel.js";
import bcrypt from "bcryptjs";
import axios from "axios";
import Receiver from "../models/receiverModel.js";
import dotenv from "dotenv";
dotenv.config();

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
  console.log("error cp3");
  try {
    const {
      foodType,
      approxPeople,
      location,
      expiryTime,
      imageUrl,

    } = req.body;
    console.log(req.body);



    const geoRes = await axios.get(
      "https://api.opencagedata.com/geocode/v1/json",
      {
        params: {
          key: process.env.OPENCAGE_API_KEY,
          q: location,
          limit: 1,
        },
      }
    );
    console.log(geoRes)
    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      throw new Error("Could not geocode address");
    }

    const { lat, lng } = geoRes.data.results[0].geometry;

    console.log("Coordinates:", { lat, lng });

    let mlResponse;
    try {
      // Note: Using the internal service name 'http://donationserver-1.onrender.com' is good, 
      // but ensure this is secure and correctly configured for internal requests in Render.
      const mlServiceUrl = "http://localhost:10000/predict-urgency";
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

      mlResponse = await axios.post(mlServiceUrl, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000,
      });
      console.log("ML service response status:", mlResponse.status);
      console.log("ML service response data:", mlResponse.data);
    } catch (mlError) {
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
      return res.status(500).json({
        message: "ML service unavailable",
        error: {
          service: "ML prediction service",
          status: mlError.response?.status || 'No response',
          details: mlError.message,
        },
        suggestion: "Please try again later or contact support"
      });
    }
    const { urgency_score, matched_ngos } = mlResponse.data;
    if (!matched_ngos || !Array.isArray(matched_ngos)) {
      console.error("Invalid ML response format:", mlResponse.data);
      return res.status(500).json({
        message: "Invalid response format from ML service",
        error: "Expected matched_ngos array"
      });
    }
    const newRequest = new Request({
      donor: req.user.id,
      foodType,
      approxPeople,
      location: {
        address: location,
        latitude: lat,
        longitude: lng,
      },
      expiryTime,
      imageUrl,
      status: "pending",
    });

    await newRequest.save();

    const top3 = matched_ngos.slice(0, 3);
    const assignedNgos = [];

    for (const ngo of top3) {
      try {
        const dbNgo = await Receiver.findOne({ name: ngo.name });
        if (dbNgo) {
          if (!dbNgo.requests) dbNgo.requests = [];
          dbNgo.requests.push(newRequest._id);
          await dbNgo.save();
          assignedNgos.push(dbNgo.name);
          console.log(`Request assigned to: ${dbNgo.name}`);
        } else {
          console.warn(`NGO not found in database: ${ngo.name}`);
        }
      } catch (ngoError) {
        console.error(`Error assigning to NGO ${ngo.name}:`, ngoError);
      }
    }

    res.status(201).json({
      message: "Request created successfully",
      request: newRequest,
      urgency_score,
      matched_ngos: top3,
      assigned_ngos: assignedNgos,
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
export const getDonorRequests = async (req, res) => {
  const { id } = req.user;
  try {
    const requests = await Request.find({ donor: id }).populate(
      "donor",
      "name phoneNumber email"
    );
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
