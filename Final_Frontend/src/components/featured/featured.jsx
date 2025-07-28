import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./featured.css";

const Featured = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  console.log('Featured component rendering, data:', data, 'loading:', loading);

  // Mock data for hotels
  const mockHotels = [
    {
      _id: "1",
      name: "The Grand Palace Hotel",
      type: "Luxury Hotel",
      city: "New Delhi",
      address: "Connaught Place, New Delhi",
      distance: "2km from city center",
      photos: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop"],
      title: "Luxury Hotel in Heart of Delhi",
      desc: "Experience luxury and comfort in the heart of New Delhi with world-class amenities and exceptional service",
      rating: 4.5,
      rooms: ["Deluxe Room", "Executive Suite", "Presidential Suite"],
      cheapestPrice: 5000,
      featured: true
    },
    {
      _id: "2",
      name: "Mumbai Seaside Resort",
      type: "Beach Resort",
      city: "Mumbai",
      address: "Marine Drive, Mumbai",
      distance: "1km from beach",
      photos: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=300&fit=crop"],
      title: "Beachfront Resort with Ocean Views",
      desc: "Relax by the Arabian Sea with stunning ocean views and premium beachfront facilities",
      rating: 4.3,
      rooms: ["Ocean View Room", "Beach Villa", "Sunset Suite"],
      cheapestPrice: 7500,
      featured: true
    },
    {
      _id: "3",
      name: "Bangalore Tech Hub Hotel",
      type: "Business Hotel",
      city: "Bangalore",
      address: "Electronic City, Bangalore",
      distance: "5km from airport",
      photos: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500&h=300&fit=crop"],
      title: "Modern Hotel for Business Travelers",
      desc: "Perfect for business trips with modern amenities, high-speed internet, and conference facilities",
      rating: 4.2,
      rooms: ["Business Room", "Executive Suite", "Conference Suite"],
      cheapestPrice: 4500,
      featured: true
    },
    {
      _id: "4",
      name: "Goa Paradise Resort",
      type: "Beach Resort",
      city: "Goa",
      address: "Calangute Beach, Goa",
      distance: "Beach front",
      photos: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&h=300&fit=crop"],
      title: "Tropical Paradise by the Beach",
      desc: "Enjoy the perfect beach vacation with water sports, spa services, and beachfront dining",
      rating: 4.6,
      rooms: ["Beach View Room", "Pool Villa", "Honeymoon Suite"],
      cheapestPrice: 6500,
      featured: true
    }
  ];

  useEffect(() => {
    console.log('Featured component mounted');
    console.log('Setting mock data:', mockHotels);
    // Set mock data immediately to ensure content is always displayed
    setData(mockHotels);
    setLoading(false);
  }, []);

  const handleViewDetails = (hotel) => {
    console.log('Navigating to hotel booking page for:', hotel);
    navigate(`/hotels/${hotel._id}/book`, {
      state: {
        hotel: hotel,
        searchData: {
          destination: hotel.city,
          checkIn: new Date().toISOString().split('T')[0],
          checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          adults: 1,
          children: 0,
          rooms: 1
        }
      }
    });
  };

  if (loading) return <div className="loading">Loading hotels...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;
  if (!data || data.length === 0) return <div className="no-data">No hotels available.</div>;

  return (
    <div className="featured-container">
      <h1 className="featured-title">🏨 Featured Hotels</h1>
      <p className="featured-subtitle">Discover the best hotels with amazing deals and world-class amenities</p>
      <div className="featured-grid">
        {data.map((hotel) => (
          <div className="hotel-card" key={hotel._id}>
            <div className="card-image-container">
              <img
                src={hotel.photos && hotel.photos[0] ? hotel.photos[0] : "https://via.placeholder.com/500x300?text=No+Image"}
                alt={hotel.name}
                className="card-image"
              />
              {hotel.rating && (
                <div className="rating-badge">
                  {hotel.rating.toFixed(1)} ★
                </div>
              )}
            </div>
            <div className="card-content">
              <h3 className="card-title">{hotel.name}</h3>
              <p className="card-location">
                <span className="location-icon">📍</span> {hotel.city}, {hotel.address}
              </p>
              <p className="card-description">{hotel.desc.substring(0, 100)}...</p>
              <div className="card-details">
                <span className="card-type">{hotel.type}</span>
                <span className="card-distance">{hotel.distance} from center</span>
              </div>
              <div className="card-footer">
                <div className="price-section">
                  <span className="card-price">₹{hotel.cheapestPrice}</span>
                  <span className="price-unit">/ night</span>
                </div>
                <button
                  className="view-button"
                  onClick={() => handleViewDetails(hotel)}
                >
                  🏨 View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Featured;