import Request from "../models/requestModel.js";
import Donor from "../models/donorModel.js";
import Pickup from "../models/pickupModel.js";
import Receiver from "../models/receiverModel.js";
import Notification from "../models/notificationModel.js";
import { isRequestVisibleToReceiver } from "../utils/requestStatus.js";

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
    const receiverId = req.user.id;
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

    const receiver = await Receiver.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ success: false, message: "Receiver not found" });
    }

    const requests = await Request.find({
      _id: { $in: receiver.requests || [] },
      expiryTime: { $gt: oneHourFromNow },
      $or: [
        { status: "pending" },
        { status: "accepted", acceptedBy: receiverId },
      ],
    }).populate({
      path: "donor",
      select: "name phoneNumber",
    });

    const visibleRequests = requests.filter((request) => isRequestVisibleToReceiver(request, receiverId));

    res.status(200).json({
      success: true,
      message: "Requests fetched successfully",
      data: visibleRequests,
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

    const receiver = await Receiver.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: "Receiver not found" });
    }

    const updatedRequest = await Request.findOneAndUpdate(
      {
        _id: requestId,
        status: "pending",
        acceptedBy: null,
      },
      {
        $set: {
          status: "accepted",
          acceptedBy: receiverId,
          acceptedAt: new Date(),
        },
      },
      { new: true }
    ).populate("donor", "name phoneNumber");

    if (!updatedRequest) {
      const existingRequest = await Request.findById(requestId);
      if (!existingRequest) {
        return res.status(404).json({ success: false, message: "Request not found" });
      }

      return res.status(409).json({
        success: false,
        message: existingRequest.status === "accepted"
          ? "This request has already been accepted"
          : "This request can no longer be accepted",
      });
    }

    await Receiver.updateMany(
      {
        _id: { $ne: receiverId },
        requests: requestId,
      },
      {
        $pull: { requests: requestId },
      }
    );

    if (!receiver.requests.includes(requestId)) {
      receiver.requests.push(requestId);
      await receiver.save();
    }

    res.status(201).json({
      success: true,
      message: "Request accepted successfully",
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

export const getReceiverNotifications = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const notifications = await Notification.find({ recipient: receiverId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching receiver notifications:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications", error: error.message });
  }
};

export const clearReceiverNotifications = async (req, res) => {
  try {
    const receiverId = req.user.id;
    
    // Delete all notifications for this receiver
    await Notification.deleteMany({ recipient: receiverId });

    res.status(200).json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    console.error("Error clearing receiver notifications:", error);
    res.status(500).json({ success: false, message: "Failed to clear notifications", error: error.message });
  }
};
