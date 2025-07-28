import express from "express";
import { createBooking, getUserBookings, getAvailableRoomsByHotelAndDates } from "../controllers/booking.js";
import { verifyUser } from "../utils/verifytoken.js";
import { body } from 'express-validator';

const router = express.Router();







router.post("/", 
  verifyUser,
  [
    body('hotelId').notEmpty().isMongoId(),
    body('roomId').notEmpty(),
    body('checkIn').notEmpty().isISO8601(),
    body('checkOut').notEmpty().isISO8601(),
    body('adults').notEmpty().isInt({ min: 1 }),
    body('children').optional().isInt({ min: 0 })
  ],
  createBooking
);


router.get("/user", verifyUser, getUserBookings);
router.get("/available/:hotelId", getAvailableRoomsByHotelAndDates);

export default router;
