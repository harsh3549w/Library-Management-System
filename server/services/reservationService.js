import cron from "node-cron";
import { Reservation } from "../models/reservationModel.js";

// Check for expired reservations every hour
export const expireOldReservations = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      
      // Find all active reservations that have expired
      const expiredReservations = await Reservation.find({
        status: "active",
        expiryDate: { $lt: now }
      });

      if (expiredReservations.length > 0) {
        // Update all expired reservations
        await Reservation.updateMany(
          {
            status: "active",
            expiryDate: { $lt: now }
          },
          {
            $set: { status: "expired" }
          }
        );

        console.log(`Expired ${expiredReservations.length} old reservations`);
      }
    } catch (error) {
      console.error("Error expiring reservations:", error);
    }
  });
};

