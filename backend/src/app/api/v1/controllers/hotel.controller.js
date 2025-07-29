// hotel/controllers/HotelController.js
import hotelService from "../../../services/hotel.service.js";

export class HotelController {
  async getHotels(req, res, next) {
    try {
      const hotels = await hotelService.getAll();
      res.status(200).json(hotels);
    } catch (err) {
      next(err);
    }
  }

  async createHotel(req, res, next) {
    try {
      const newHotel = await hotelService.create(req.body);
      res.status(201).json(newHotel);
    } catch (err) {
      next(err);
    }
  }

  async getHotel(req, res, next) {
    try {
      const hotel = await hotelService.getById(req.params.id);
      if (!hotel) return res.status(404).json({ message: "Hotel not found" });
      res.status(200).json(hotel);
    } catch (err) {
      next(err);
    }
  }

  async updateHotel(req, res, next) {
    try {
      const updatedHotel = await hotelService.updateById(req.params.id, req.body);
      if (!updatedHotel) return res.status(404).json({ message: "Hotel not found" });
      res.status(200).json(updatedHotel);
    } catch (err) {
      next(err);
    }
  }

  async deleteHotel(req, res, next) {
    try {
      await hotelService.deleteById(req.params.id);
      res.status(200).json({ message: "Hotel deleted successfully" });
    } catch (err) {
      next(err);
    }
  }



  async getPaginatedHotels(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await hotelService.getPaginatedHotels(page, limit);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
  }

  async searchHotels(req, res, next) {
    try {
      console.log('Searching hotels...');
        const searchParams = {
            city: req.query.city,
            checkIn: req.query.checkIn,
            checkOut: req.query.checkOut,
            guests: parseInt(req.query.guests) || 1,
            rooms: parseInt(req.query.rooms) || 1,
            maxPrice: parseFloat(req.query.maxPrice),
            minRating: parseFloat(req.query.minRating),
            amenities: req.query.amenities ? req.query.amenities.split(',') : []
        };

        const hotels = await hotelService.searchHotels(searchParams);
        res.status(200).json(hotels);
    } catch (err) {
        next(err);
    }
  }
}

// Export an instance
export default new HotelController();
