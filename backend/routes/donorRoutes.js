import express from "express";
import multer from "multer";
import {
  editDonorProfile,
  donorRequest,
  getDonorRequests,
  getDonorProfile,
  cancelDonationRequest,
  generatePickupOtp,
  verifyPickupOtp,
} from "../controllers/donorController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
const donorRouter = express.Router();

// multer in-memory storage (we'll stream to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

donorRouter.post("/edit-profile", verifyToken, editDonorProfile);
// Use multer middleware to accept a single file field named 'image'
donorRouter.post("/donor-request", verifyToken, upload.single("image"), donorRequest);
donorRouter.post("/cancel-request/:requestId", verifyToken, cancelDonationRequest);
donorRouter.post("/generate-pickup-otp/:requestId", verifyToken, generatePickupOtp);
donorRouter.post("/verify-pickup-otp/:requestId", verifyToken, verifyPickupOtp);
donorRouter.get("/donor-requests", verifyToken, getDonorRequests);
donorRouter.get("/donorProfile", verifyToken, getDonorProfile);

export default donorRouter;
