// hotel/services/HotelService.js
import BaseService from "./base/base.service.js";
import hotelRepository from "../repositories/hotel.repository.js";

const HOTEL_IMAGES = {
    exterior: [
        {
            url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60",
            label: "Modern Hotel Exterior"
        },
        {
            url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&auto=format&fit=crop&q=60",
            label: "Luxury Hotel Front"
        },
        {
            url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&auto=format&fit=crop&q=60",
            label: "Resort Entrance"
        }
    ],
    rooms: [
        {
            url: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&auto=format&fit=crop&q=60",
            label: "Deluxe Room"
        },
        {
            url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&auto=format&fit=crop&q=60",
            label: "Suite Room"
        },
        {
            url: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=500&auto=format&fit=crop&q=60",
            label: "Executive Room"
        }
    ],
    pools: [
        {
            url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&auto=format&fit=crop&q=60",
            label: "Infinity Pool"
        },
        {
            url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=500&auto=format&fit=crop&q=60",
            label: "Resort Pool"
        },
        {
            url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=500&auto=format&fit=crop&q=60",
            label: "Swimming Pool"
        }
    ],
    lobbies: [
        {
            url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500&auto=format&fit=crop&q=60",
            label: "Grand Lobby"
        },
        {
            url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60",
            label: "Modern Lobby"
        },
        {
            url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60",
            label: "Luxury Lobby"
        }
    ],
    dining: [
        {
            url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500&auto=format&fit=crop&q=60",
            label: "Restaurant"
        },
        {
            url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60",
            label: "Dining Area"
        },
        {
            url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60",
            label: "Cafe"
        }
    ]
};

export class HotelService extends BaseService {
    constructor() {
        super(hotelRepository);
    }

    getConsistentImages(hotelId) {
        const photos = [];
        // Use hotelId to generate consistent indices
        const idHash = hotelId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        Object.keys(HOTEL_IMAGES).forEach((category, categoryIndex) => {
            const images = HOTEL_IMAGES[category];
            // Generate a consistent index based on hotelId and category
            const index = (idHash + categoryIndex) % images.length;
            photos.push({
                ...images[index],
                index: photos.length
            });
        });
        return photos;
    }

    async getPaginatedHotels(page, limit) {
        if (page < 1) throw new Error('Page number must be greater than 0');
        if (limit < 1) throw new Error('Limit must be greater than 0');
        
        const result = await hotelRepository.getPaginatedHotels(page, limit);
        
        // Add consistent default images to hotels without photos
        result.hotels = result.hotels.map(hotel => {
            if (!hotel.photos || hotel.photos.length === 0) {
                return {
                    ...hotel.toObject(),
                    photos: this.getConsistentImages(hotel._id)
                };
            }
            return hotel;
        });

        return result;
    }

    async searchHotels(searchParams) {
        try {
            const {
                city,
                checkIn,
                checkOut,
                guests,
                rooms,
                maxPrice,
                minRating,
                amenities
            } = searchParams;

            // Build search query
            const query = {};

            // City search (case-insensitive)
            if (city) {
                query.city = { $regex: city, $options: 'i' };
            }

            // Price filter
            if (maxPrice) {
                query.cheapestPrice = { $lte: maxPrice };
            }

            // Rating filter
            if (minRating) {
                query.rating = { $gte: minRating };
            }

            // Amenities filter
            if (amenities && amenities.length > 0) {
                query.amenities = { $in: amenities };
            }

            // Execute search
            const hotels = await hotelRepository.searchHotels(query);

            // Add consistent default images to hotels without photos
            const hotelsWithImages = hotels.map(hotel => {
                if (!hotel.photos || hotel.photos.length === 0) {
                    return {
                        ...hotel.toObject(),
                        photos: this.getConsistentImages(hotel._id)
                    };
                }
                return hotel;
            });

            return hotelsWithImages;
        } catch (error) {
            throw new Error(`Hotel search failed: ${error.message}`);
        }
    }
}

export default new HotelService();
