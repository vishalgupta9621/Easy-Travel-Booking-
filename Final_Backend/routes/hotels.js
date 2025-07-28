import express from "express";
import {
  getHotels,
  getHotelsByCity,
  getCities,
  getHotelById
} from "../controllers/hotel.js";

const router = express.Router();

router.get("/", getHotels);
router.get("/cities", getCities);
router.get("/city/:cityId", getHotelsByCity);
router.get("/:id", getHotelById);

export default router;