import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Donor",
    required: true,
  },
  donationType: {
    type: String,
    enum: ["food", "clothes", "toys", "books"],
    default: "food",
    required: true,
  },
  // Food donation fields
  foodType: {
    type: String,
    enum: ["Cooked", "Dry", "Fresh"],
  },
  approxPeople: {
    type: Number,
  },
  imageUrl: {
    type: String,
    default: "",
  },

  // Clothes donation fields
  clothesType: String,
  size: String,
  condition: String,
  quantity: Number,

  // Toys donation fields
  ageGroup: String,

  // Books donation fields
  title: String,
  author: String,

  // Common fields
  location: {
    address: {
      type: String,
      required: true,
    },
    latitude: String,
    longitude: String,
  },
  expiryTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "collected", "expired"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Receiver",
    default: null,
  },
});

// Index to optimize queries filtering by expiry status
requestSchema.index({ status: 1, expiryTime: 1 });

const Request = mongoose.model("Request", requestSchema);
export default Request;
