import cron from "node-cron";
import Request from "../models/requestModel.js";

/**
 * Cron job to mark donation requests as expired
 * Runs every 5 minutes to check and update requests that are expiring soon (within 1 hour)
 */
export const startExpiryJob = () => {
  // Run every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

      // Find all pending requests where expiryTime is within the next hour
      const result = await Request.updateMany(
        {
          status: "pending",
          expiryTime: { $lte: oneHourFromNow },
        },
        {
          $set: { status: "expired" },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `✅ Expiry Job: Marked ${result.modifiedCount} request(s) as expired`
        );
      }
    } catch (error) {
      console.error("❌ Error in expiry job:", error);
    }
  });

  console.log("🕐 Expiry job started - runs every 5 minutes");
};

export default startExpiryJob;
