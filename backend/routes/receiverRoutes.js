import express from "express";
import { getTotalRequests,getTotalDonors ,getAllRequests,acceptRequest, getPickupHistory, getReceiverProfile, editReceiverProfile, getReceiverNotifications, clearReceiverNotifications } from "../controllers/receiverController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const receiverRouter = express.Router();
receiverRouter.get('/total-requests',verifyToken,getTotalRequests);
receiverRouter.get('/total-donors',verifyToken,getTotalDonors);
receiverRouter.get('/requests',verifyToken,getAllRequests);
receiverRouter.post('/accept-request/:requestId',verifyToken, acceptRequest);
receiverRouter.get('/pickup-history',verifyToken, getPickupHistory);
receiverRouter.get('/profile',verifyToken, getReceiverProfile);
receiverRouter.get('/notifications', verifyToken, getReceiverNotifications);
receiverRouter.delete('/notifications', verifyToken, clearReceiverNotifications);
receiverRouter.put('/edit-profile',verifyToken, editReceiverProfile);
export default receiverRouter;