import express from "express";
import hotelController from "../app/api/v1/controllers/hotel.controller.js";
const router = express.Router();

// Get all hotels
router.get("/", hotelController.getHotels);

// Get paginated hotels (must come before /:id route)
router.get("/paginated", hotelController.getPaginatedHotels);

// Search hotels (must come before /:id route)
router.get("/search", hotelController.searchHotels);

// Create new hotel
router.post("/", hotelController.createHotel);

// Get single hotel
router.get("/:id", hotelController.getHotel);

// Update hotel
router.put("/:id", hotelController.updateHotel);

// Delete hotel
router.delete("/:id", hotelController.deleteHotel);

export default router;
