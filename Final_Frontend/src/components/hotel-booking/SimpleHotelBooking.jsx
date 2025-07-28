import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/footer";
import "./Booking.css";

const SimpleHotelBooking = () => {
  const { id: hotelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get hotel data from navigation state
  const [hotel, setHotel] = useState(location.state?.hotel || null);
  const [searchData, setSearchData] = useState(location.state?.searchData || {
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    adults: 1,
    children: 0,
    rooms: 1
  });
  
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [numberOfNights, setNumberOfNights] = useState(1);
  const [loading, setLoading] = useState(!hotel);

  // Mock room data
  const mockRooms = [
    {
      _id: "room1",
      title: "Deluxe Room",
      price: hotel?.cheapestPrice || 5000,
      desc: "Spacious room with modern amenities, king-size bed, and city view",
      maxPeople: 2,
      amenities: ["Free WiFi", "Air Conditioning", "Room Service", "Mini Bar"],
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=250&fit=crop"
    },
    {
      _id: "room2", 
      title: "Executive Suite",
      price: Math.round((hotel?.cheapestPrice || 5000) * 1.5),
      desc: "Luxury suite with separate living area, premium amenities, and balcony",
      maxPeople: 4,
      amenities: ["Free WiFi", "Air Conditioning", "Room Service", "Mini Bar", "Balcony", "Living Area"],
      image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=250&fit=crop"
    },
    {
      _id: "room3",
      title: "Presidential Suite", 
      price: Math.round((hotel?.cheapestPrice || 5000) * 2.5),
      desc: "Ultimate luxury with panoramic views, jacuzzi, and personal butler service",
      maxPeople: 6,
      amenities: ["Free WiFi", "Air Conditioning", "Room Service", "Mini Bar", "Jacuzzi", "Butler Service", "Panoramic View"],
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=250&fit=crop"
    }
  ];

  useEffect(() => {
    // If no hotel data from navigation, create mock data
    if (!hotel && hotelId) {
      const mockHotel = {
        _id: hotelId,
        name: "Premium Hotel",
        city: "Sample City",
        address: "123 Hotel Street, Sample City",
        photos: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop"],
        desc: "A beautiful hotel with excellent amenities and world-class service",
        rating: 4.5,
        cheapestPrice: 5000,
        type: "Luxury Hotel"
      };
      setHotel(mockHotel);
      setLoading(false);
    }

    // Calculate number of nights
    if (searchData.checkIn && searchData.checkOut) {
      const checkInDate = new Date(searchData.checkIn);
      const checkOutDate = new Date(searchData.checkOut);
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      setNumberOfNights(nights > 0 ? nights : 1);
    }
  }, [hotel, hotelId, searchData]);

  useEffect(() => {
    // Calculate total price when room or dates change
    if (selectedRoom) {
      setTotalPrice(selectedRoom.price * numberOfNights);
    }
  }, [selectedRoom, numberOfNights]);

  useEffect(() => {
    // Auto-select first room if none selected
    if (mockRooms.length > 0 && !selectedRoom) {
      setSelectedRoom(mockRooms[0]);
    }
  }, [mockRooms, selectedRoom]);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const handleBookNow = () => {
    if (!selectedRoom) {
      alert('Please select a room first');
      return;
    }

    console.log('Booking hotel with data:', {
      hotel,
      selectedRoom,
      searchData,
      totalPrice,
      numberOfNights
    });

    // Navigate to booking form with hotel and room data
    navigate('/booking', {
      state: {
        travelType: 'hotel',
        serviceData: {
          hotel: hotel,
          room: selectedRoom,
          searchData: searchData,
          totalPrice: totalPrice,
          numberOfNights: numberOfNights
        }
      }
    });
  };

  const handleSearchUpdate = (field, value) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="hotel-booking">
        <Navbar />
        <div className="loading-container">
          <div className="loading">Loading hotel details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="hotel-booking">
        <Navbar />
        <div className="error-container">
          <div className="error">Hotel not found</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="hotel-booking">
      <Navbar />
      
      <div className="booking-container">
        {/* Hotel Header */}
        <div className="hotel-header">
          <div className="hotel-image">
            <img 
              src={hotel.photos && hotel.photos[0] ? hotel.photos[0] : "https://via.placeholder.com/600x300"} 
              alt={hotel.name}
            />
          </div>
          <div className="hotel-info">
            <h1>{hotel.name}</h1>
            <p className="hotel-location">📍 {hotel.address || `${hotel.city}`}</p>
            <p className="hotel-description">{hotel.desc}</p>
            <div className="hotel-rating">
              <span className="rating">⭐ {hotel.rating}/5</span>
              <span className="hotel-type">{hotel.type}</span>
            </div>
          </div>
        </div>

        {/* Search Summary */}
        <div className="search-summary">
          <h3>Your Stay Details</h3>
          <div className="search-details">
            <div className="search-item">
              <label>Check-in:</label>
              <input 
                type="date" 
                value={searchData.checkIn}
                onChange={(e) => handleSearchUpdate('checkIn', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="search-item">
              <label>Check-out:</label>
              <input 
                type="date" 
                value={searchData.checkOut}
                onChange={(e) => handleSearchUpdate('checkOut', e.target.value)}
                min={searchData.checkIn}
              />
            </div>
            <div className="search-item">
              <label>Guests:</label>
              <span>{searchData.adults} Adults, {searchData.children} Children</span>
            </div>
            <div className="search-item">
              <label>Nights:</label>
              <span>{numberOfNights} night{numberOfNights > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Room Selection */}
        <div className="room-selection">
          <h3>Choose Your Room</h3>
          <div className="rooms-grid">
            {mockRooms.map(room => (
              <div 
                key={room._id} 
                className={`room-card ${selectedRoom?._id === room._id ? 'selected' : ''}`}
                onClick={() => handleRoomSelect(room)}
              >
                <div className="room-image">
                  <img src={room.image} alt={room.title} />
                </div>
                <div className="room-details">
                  <h4>{room.title}</h4>
                  <p className="room-desc">{room.desc}</p>
                  <div className="room-amenities">
                    {room.amenities.slice(0, 3).map(amenity => (
                      <span key={amenity} className="amenity-tag">{amenity}</span>
                    ))}
                  </div>
                  <div className="room-capacity">
                    <span>👥 Up to {room.maxPeople} guests</span>
                  </div>
                  <div className="room-pricing">
                    <span className="room-price">₹{room.price}</span>
                    <span className="price-unit">/ night</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Summary */}
        {selectedRoom && (
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="summary-details">
              <div className="summary-item">
                <span>Room:</span>
                <span>{selectedRoom.title}</span>
              </div>
              <div className="summary-item">
                <span>Nights:</span>
                <span>{numberOfNights}</span>
              </div>
              <div className="summary-item">
                <span>Rate per night:</span>
                <span>₹{selectedRoom.price}</span>
              </div>
              <div className="summary-item total">
                <span>Total Amount:</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>
            <button className="book-now-btn" onClick={handleBookNow}>
              🎯 Book Now
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SimpleHotelBooking;
