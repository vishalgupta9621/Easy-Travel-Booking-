// hotel/repositories/HotelRepository.js
import BaseRepository from "./base/base.repository.js";
import Hotel from "../models/Hotel.js";
export class HotelRepository extends BaseRepository {
  constructor() {
    super(Hotel);
  }


  async getPaginatedHotels(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const hotels = await this.model.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    
    const total = await this.model.countDocuments();
    
    return {
      hotels,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / limit)
        }
    };
}
async searchHotels(query = {}) {
  return await this.model.find(query).sort({ createdAt: -1 });
}

}

export default new HotelRepository();
