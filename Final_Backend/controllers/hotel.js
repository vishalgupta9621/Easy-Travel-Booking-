import Hotel from "../models/Hotel.js";



export const getHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find(); // Fetch all documents
    res.status(200).json(hotels);
  } catch (err) {
    next(err);
  }
};


export const getCities = async (req, res, next) => {
  try {
    const cities = await Hotel.aggregate([
      {
        $group: {
          _id: "$city", // Group by exact city name
          count: { $sum: 1 },
          image: { $first: "$photos" }
        }
      },
      {
        $project: {
          name: "$_id",
          count: 1,
          image: { $arrayElemAt: ["$image", 0] },
          _id: "$_id" // Keep the original city name as ID
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json(cities);
  } catch (err) {
    next(err);
  }
};

export const getHotelsByCity = async (req, res, next) => {
  try {
    const { cityId } = req.params;
    // Use the exact city name for lookup
    const hotels = await Hotel.find({ city: cityId });
    
    if (hotels.length === 0) {
      return res.status(404).json({ 
        message: "No hotels found for this city",
        city: cityId // Include the city name in the response
      });
    }
    
    res.status(200).json(hotels);
  } catch (err) {
    next(err);
  }
};



export const getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    res.status(200).json(hotel);
  } catch (err) {
    next(err);
  }
};