// models/Room.js
import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    title: { // e.g., "Deluxe King Room", "Standard Double"
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    maxOccupancy: {
      type: Number,
      required: true,
    },
    desc: { // A general description for this room type
      type: String,
      required: true,
    },
    roomNumbers: [ // Array of individual physical rooms with their availability
      {
        number: { type: Number, required: true }, // The actual physical room number (e.g., 101, 203)
        unavailableDates: { type: [Date] }, // Array of dates when this specific room is unavailable
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Room", RoomSchema);