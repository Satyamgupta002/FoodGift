import Request from "../models/requestModel.js";
import Donor from "../models/donorModel.js";
import Pickup from "../models/pickupModel.js";
import Receiver from "../models/receiverModel.js";

export const getTotalRequests = async (req, res) => {
  try {
    const receiverId = req.user.id; // assuming auth middleware sets req.user

    const totalRequests = await Pickup.countDocuments({ receiver: receiverId });

    res.status(200).json({ totalRequests });
  } catch (error) {
    console.error("Error fetching total requests:", error);
    res.status(500).json({ message: "Failed to fetch total requests" });
  }
};
export const getTotalDonors = async (req, res) => {
  try {
    const receiverId = req.user.id;

    const uniqueDonors = await Pickup.distinct("donor", {
      receiver: receiverId,
    });

    res.status(200).json({ totalDonors: uniqueDonors.length });
  } catch (error) {
    console.error("Error fetching total donors:", error);
    res.status(500).json({ error: "Error while fetching the donors" });
  }
};

export const getAllRequests = async (req, res) => {
  try {
    const receiverId = req.user.id; // assuming req.user is set via auth middleware
    // console.log(receiverId);
    // Calculate 1 hour before now to filter out requests expiring soon
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    // Find receiver and populate their request documents
    const receiver = await Receiver.findById(receiverId).populate({
      path: "requests",
      match: { 
        status: "pending",
        expiryTime: { $gt: oneHourFromNow } // Only show requests expiring more than 1 hour away
      },
      populate: {
        path: "donor",
          select: "name phoneNumber",
      },
    });

    if (!receiver) {
      return res
        .status(404)
        .json({ success: false, message: "Receiver not found" });
    }
    console.log(receiver.requests)
    res.status(200).json({
      success: true,
      message: "Requests fetched successfully",
      data: receiver.requests,
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
      error: error.message,
    });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const receiverId = req.user.id;

    // 1. Find the receiver and populate their requests with donor info
    const receiver = await Receiver.findById(receiverId).populate({
      path: "requests",
      populate: {
        path: "donor",
        model: "Donor",
      },
    });

    if (!receiver) {
      return res
        .status(404)
        .json({ success: false, message: "Receiver not found" });
    }

    // 2. Find the request in receiver's list
    const request = receiver.requests.find(
      (req) => req._id.toString() === requestId
    );
    if (!request) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Request not found in receiver's list",
        });
    }

    console.log(req.user)
    // 3. Update request status to "picked up"
    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      { status: "picked up",acceptedBy:req.user.id },
      { new: true }
    );

    // 4. Create and save pickup
    const newPickup = new Pickup({
      receiver: receiverId,
      donor: request.donor._id,
      request: request._id,
      foodType: request.foodType,
      quantity: request.quantity,
      status: "completed",
    });

    await newPickup.save();

    // 5. (Optional) Remove from receiver's pending requests
    receiver.requests = receiver.requests.filter(
      (req) => req._id.toString() !== requestId
    );
    await receiver.save();

    res.status(201).json({
      success: true,
      message: "Request accepted, marked as picked up, and pickup recorded",
      pickup: newPickup,
      updatedRequest,
    });
  } catch (error) {
    console.error("Error in acceptRequest:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPickupHistory = async (req, res) => {
  try {
    const receiverId = req.user.id;

    // 1. Fetch all pickups done by this receiver
    const pickups = await Pickup.find({ receiver: receiverId })
      .populate("donor", "name email phoneNumber")
      .populate("request");

    res.status(200).json({
      success: true,
      message: "Pickup history fetched successfully",
      pickups,
    });
  } catch (error) {
    console.error("Error in getPickupHistory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pickup history",
    });
  }
};

export const getReceiverProfile = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const receiver = await Receiver.findById(receiverId).select("-password");

    if (!receiver) {
      return res.status(404).json({ success: false, message: "Receiver not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      receiver,
    });
  } catch (error) {
    console.error("Error fetching receiver profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

export const editReceiverProfile = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const { organizationName, name, phoneNumber, address } = req.body;

    const receiver = await Receiver.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: "Receiver not found" });
    }

    if (organizationName) receiver.organizationName = organizationName;
    if (name) receiver.name = name;
    if (phoneNumber) receiver.phoneNumber = phoneNumber;
    if (address) receiver.location.address = address;

    const updatedReceiver = await receiver.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      receiver: updatedReceiver.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } }),
    });
  } catch (error) {
    console.error("Error updating receiver profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};
