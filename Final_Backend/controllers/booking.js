import mongoose from "mongoose";
import HotelBooking from "../models/HotelBooking.js";
import Hotel from "../models/Hotel.js";
import { createError } from "../utils/error.js";
import Room from "../models/Room.js";

// --- Helper function to get dates in a range ---
const getDatesInRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates = [];
  let currentDate = new Date(start);

  while (currentDate < end) { // Use < for checkOut date, as checkOut is when you leave
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};


export const getAvailableRoomsByHotelAndDates = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const { startDate, endDate, adults } = req.query;

        if (!startDate || !endDate) {
            return next(createError(400, "Check-in and Check-out dates are required."));
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
            return next(createError(400, "Invalid date range."));
        }

        const hotel = await Hotel.findById(hotelId).populate("rooms");

        if (!hotel) {
            return next(createError(404, "Hotel not found."));
        }

        // Get all room numbers that are UNAVAILABLE for the given date range from existing bookings
        // We now select roomId and roomNumber, not roomNumberId
        const bookedRooms = await HotelBooking.find({
            hotelId: hotel._id,
            $or: [
                {
                    checkIn: { $lt: end },
                    checkOut: { $gt: start }
                },
                {
                    checkIn: { $lte: start },
                    checkOut: { $gte: end }
                }
            ]
        }).select('roomId roomNumber -_id'); // Select roomId and roomNumber

        // Create a set of booked room identifiers for quick lookup
        // The identifier will be a combination of roomId and roomNumber
        const bookedRoomIdentifiers = new Set(
            bookedRooms.map(b => `${b.roomId.toString()}-${b.roomNumber}`)
        );

        let availablePhysicalRooms = [];

        for (const roomType of hotel.rooms) {
            if (roomType.roomNumbers && Array.isArray(roomType.roomNumbers)) {
                for (const physicalRoom of roomType.roomNumbers) {
                    // Unique identifier for this specific physical room
                    const currentPhysicalRoomIdentifier = `${roomType._id.toString()}-${physicalRoom.number}`;

                    // 1. Check if this physical room is marked as unavailable for maintenance/long-term
                    const isTemporarilyUnavailable = physicalRoom.unavailableDates.some(
                        (dateStr) => {
                            const unavailDate = new Date(dateStr);
                            return getDatesInRange(start, end).some(reqDate =>
                                reqDate.toISOString().split('T')[0] === unavailDate.toISOString().split('T')[0]
                            );
                        }
                    );

                    // 2. Check if this physical room is already booked for the requested dates
                    const isBooked = bookedRoomIdentifiers.has(currentPhysicalRoomIdentifier);

                    if (!isTemporarilyUnavailable && !isBooked && parseInt(adults, 10) <= roomType.maxOccupancy) {
                        availablePhysicalRooms.push({
                            // We still use physicalRoom._id for the frontend's key and selection value
                            _id: physicalRoom._id.toString(), // Unique ID for the sub-document
                            number: physicalRoom.number,
                            title: roomType.title,
                            price: roomType.price,
                            maxOccupancy: roomType.maxOccupancy,
                            roomTypeId: roomType._id.toString(), // The ID of the Room TYPE
                        });
                    }
                }
            }
        }
        res.status(200).json(availablePhysicalRooms);
    } catch (err) {
        next(err);
    }
};



export const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Destructure required fields from the request body.
    // We now expect 'roomNumber' to identify the specific physical room.
    const { hotelId, roomId, roomNumber, checkIn, checkOut, adults, children } = req.body;

    // --- 1. Basic Input Validation ---
    if (!hotelId || !roomId || !roomNumber || !checkIn || !checkOut || adults === undefined) {
      await session.abortTransaction();
      return next(createError(400, "Missing required booking fields. Please provide hotelId, roomId (type), roomNumber, checkIn, checkOut, and adults."));
    }

    // --- 2. Date Validation ---
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) { // Use getTime() for robust Date object validation
      await session.abortTransaction();
      return next(createError(400, "Invalid date format. Please use a valid date string (e.g., YYYY-MM-DD)."));
    }

    if (startDate >= endDate) {
      await session.abortTransaction();
      return next(createError(400, "Check-out date must be after check-in date."));
    }

    if (startDate < new Date(new Date().setHours(0,0,0,0))) { // Check if check-in is not in the past
      await session.abortTransaction();
      return next(createError(400, "Check-in date cannot be in the past."));
    }

    const requestedDates = getDatesInRange(startDate, endDate);

    // --- 3. Find Hotel and Room Type ---
    // Populate the 'rooms' field to get the full Room documents linked to the hotel.
    const hotel = await Hotel.findById(hotelId).populate("rooms").session(session);
    if (!hotel) {
      await session.abortTransaction();
      return next(createError(404, "Hotel not found."));
    }

    // Find the specific room TYPE (e.g., "Deluxe King Room") by its ID within the hotel's populated rooms.
    const roomType = hotel.rooms.find(r => r._id.toString() === roomId);
    if (!roomType) {
      await session.abortTransaction();
      return next(createError(404, "Room type not found in this hotel."));
    }

    // Find the specific PHYSICAL room NUMBER (e.g., room 101) within the room type's `roomNumbers` array.
    const specificRoom = roomType.roomNumbers.find(rNum => rNum.number === roomNumber);
    if (!specificRoom) {
      await session.abortTransaction();
      return next(createError(404, `Specific room number ${roomNumber} not found for this room type (${roomType.title}).`));
    }

    // --- 4. Check Capacity ---
    if (adults > roomType.maxOccupancy) { // Check against roomType's maxOccupancy
      await session.abortTransaction();
      return next(createError(400, `This room type (${roomType.title}) only accommodates ${roomType.maxOccupancy} adults.`));
    }

    // --- 5. Check Availability for Specific Physical Room ---
    // Ensure none of the requested dates are already in `specificRoom.unavailableDates`.
    const isAvailable = requestedDates.every(reqDate => {
      // Compare dates by their YYYY-MM-DD string representation for robust comparison.
      const reqDateStr = reqDate.toISOString().split('T')[0];
      return !specificRoom.unavailableDates.some(unavailDate =>
        unavailDate.toISOString().split('T')[0] === reqDateStr
      );
    });

    if (!isAvailable) {
      await session.abortTransaction();
      return next(createError(409, `Room ${roomNumber} is unavailable for some of the requested dates.`));
    }

    // --- 6. Calculate Price ---
    const nights = requestedDates.length; // Number of nights is simply the count of days in range
    const totalPrice = roomType.price * nights; // Use the roomType's price

    // --- 7. Create Booking Record ---
    const booking = new HotelBooking({
      hotelId,
      roomId, // This is the ID of the Room TYPE
      roomNumber, // This is the specific physical room number
      userId: req.user.id, // Assuming user ID is available from auth middleware
      checkIn: startDate,
      checkOut: endDate,
      adults,
      children: children || 0, // Default to 0 if not provided
      totalPrice,
      status: "confirmed", // Or "pending" if you have a payment gateway step
    });

    const savedBooking = await booking.save({ session }); // Save the booking within the transaction

    // --- 8. Mark Dates as Unavailable in Room Model ---
    specificRoom.unavailableDates.push(...requestedDates);
    // Save the updated Room document to persist the `unavailableDates` change.
    await roomType.save({ session });

    // --- 9. Commit Transaction ---
    await session.commitTransaction();
    res.status(201).json(savedBooking);

  } catch (err) {
    // --- 10. Handle Errors and Abort Transaction ---
    await session.abortTransaction();
    console.error('Booking creation failed:', {
      error: err.message,
      stack: err.stack,
      body: req.body,
      user: req.user?.id
    });
    next(createError(500, "Failed to create booking. An unexpected error occurred."));
  } finally {
    // --- 11. End Session ---
    session.endSession();
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    // Find bookings by userId and populate references for display.
    // 'hotelId' refers to the Hotel model, 'roomId' refers to the Room model.
    const bookings = await HotelBooking.find({ userId: req.user.id })
      .populate("hotelId", "name city address photos") // Populate hotel details
      .populate("roomId", "title price type maxOccupancy"); // Populate room type details

    if (!bookings.length) {
      return next(createError(404, "No bookings found for this user."));
    }

    res.status(200).json(bookings);
  } catch (err) {
    console.error('Failed to fetch user bookings:', {
      error: err.message,
      user: req.user?.id
    });
    next(createError(500, "Failed to retrieve bookings. An unexpected error occurred."));
  }
};


