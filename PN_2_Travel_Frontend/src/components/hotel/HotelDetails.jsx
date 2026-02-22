import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './HotelDetails.css';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingPreferences, setBookingPreferences] = useState(null);

  useEffect(() => {
    loadHotelData();
  }, [id]);

  const loadHotelData = async () => {
    try {
      setLoading(true);

      // First try to get from localStorage (for immediate display)
      const viewingHotel = localStorage.getItem('viewingHotel');
      const hotelBookingData = localStorage.getItem('hotelBookingData');

      if (viewingHotel) {
        const hotelData = JSON.parse(viewingHotel);
        setHotel(hotelData);

        // Set booking preferences if available
        if (hotelData.bookingPreferences) {
          setBookingPreferences(hotelData.bookingPreferences);
        } else if (hotelBookingData) {
          setBookingPreferences(JSON.parse(hotelBookingData));
        }
      }

      // Then fetch fresh data from API
      const response = await fetch(`http://localhost:8800/api/v1/hotels/${id}`);
      if (response.ok) {
        const hotelData = await response.json();
        setHotel(hotelData);
      } else if (!viewingHotel) {
        // If no localStorage data and API fails, show error
        console.error('Failed to load hotel data');
      }
    } catch (error) {
      console.error('Error loading hotel data:', error);
      // Keep localStorage data if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Store booking data with preferences
    const bookingData = {
      type: 'hotel',
      item: hotel,
      timestamp: new Date().toISOString(),
      // Include booking preferences if available
      ...(bookingPreferences && {
        checkIn: bookingPreferences.checkIn,
        checkOut: bookingPreferences.checkOut,
        guests: bookingPreferences.guests,
        rooms: bookingPreferences.rooms
      })
    };

    console.log('Storing booking data:', bookingData);
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    navigate(`/booking/hotel/${hotel._id}`);
  };

  if (loading) {
    return <div className="loading">Loading hotel details...</div>;
  }

  if (!hotel) {
    return (
      <div className="no-hotel">
        <h2>Hotel not found</h2>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="hotel-details">
      <div className="hotel-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Search
        </button>
        <h1>{hotel.name}</h1>
        <div className="hotel-rating">
          <span className="stars">{'⭐'.repeat(Math.floor(hotel.rating))}</span>
          <span className="rating-text">{hotel.rating}/5</span>
        </div>
      </div>

      <div className="hotel-content">
        <div className="hotel-images">
          {hotel.photos && hotel.photos.length > 0 ? (
            <div className="image-gallery">
              {hotel.photos.slice(0, 4).map((photo, index) => (
                <img 
                  key={index} 
                  src={photo.url || photo} 
                  alt={`${hotel.name} - ${index + 1}`}
                  className="hotel-image"
                />
              ))}
            </div>
          ) : (
            <div className="no-images">
              <div className="placeholder-image">
                🏨
                <p>No images available</p>
              </div>
            </div>
          )}
        </div>

        <div className="hotel-info">
          <div className="info-section">
            <h3>Location</h3>
            <p>📍 {hotel.address}</p>
            <p>🏙️ {hotel.city}</p>
            <p>📏 {hotel.distance}</p>
          </div>

          <div className="info-section">
            <h3>Pricing</h3>
            <div className="price-info">
              <span className="price">₹{hotel.cheapestPrice}</span>
              <span className="price-unit">per night</span>
            </div>
          </div>

          <div className="info-section">
            <h3>Description</h3>
            <p>{hotel.desc || 'No description available'}</p>
          </div>

          {hotel.rooms && hotel.rooms.length > 0 && (
            <div className="info-section">
              <h3>Available Rooms</h3>
              <div className="rooms-list">
                {hotel.rooms.map((room, index) => (
                  <div key={index} className="room-item">
                    <span>{room}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bookingPreferences && (
            <div className="info-section booking-preferences">
              <h3>Your Stay Details</h3>
              <div className="preferences-grid">
                <div className="preference-item">
                  <span className="preference-label">📅 Check-in:</span>
                  <span className="preference-value">{new Date(bookingPreferences.checkIn).toLocaleDateString()}</span>
                </div>
                <div className="preference-item">
                  <span className="preference-label">📅 Check-out:</span>
                  <span className="preference-value">{new Date(bookingPreferences.checkOut).toLocaleDateString()}</span>
                </div>
                <div className="preference-item">
                  <span className="preference-label">👥 Guests:</span>
                  <span className="preference-value">{bookingPreferences.guests}</span>
                </div>
                <div className="preference-item">
                  <span className="preference-label">🏠 Rooms:</span>
                  <span className="preference-value">{bookingPreferences.rooms}</span>
                </div>
                <div className="preference-item">
                  <span className="preference-label">🌙 Nights:</span>
                  <span className="preference-value">
                    {(() => {
                      const checkInDate = new Date(bookingPreferences.checkIn);
                      const checkOutDate = new Date(bookingPreferences.checkOut);
                      const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
                      const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                      return nights;
                    })()}
                  </span>
                </div>
                <div className="preference-item total-cost">
                  <span className="preference-label">💰 Total Cost:</span>
                  <span className="preference-value">
                    ₹{(() => {
                      const checkInDate = new Date(bookingPreferences.checkIn);
                      const checkOutDate = new Date(bookingPreferences.checkOut);
                      const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
                      const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                      const pricePerNight = parseInt(hotel.cheapestPrice) || 0;
                      const totalCost = pricePerNight * nights * bookingPreferences.rooms;
                      console.log('Hotel Details Total Calculation:', {
                        hotelPrice: hotel.cheapestPrice,
                        pricePerNight,
                        nights,
                        rooms: bookingPreferences.rooms,
                        totalCost,
                        checkIn: bookingPreferences.checkIn,
                        checkOut: bookingPreferences.checkOut,
                        calculation: `${pricePerNight} × ${nights} × ${bookingPreferences.rooms} = ${totalCost}`
                      });
                      return totalCost.toLocaleString();
                    })()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="info-section">
            <h3>Amenities</h3>
            <div className="amenities-list">
              <span className="amenity">🅿️ Free Parking</span>
              <span className="amenity">📶 Free WiFi</span>
              <span className="amenity">🏊 Swimming Pool</span>
              <span className="amenity">🍽️ Restaurant</span>
              <span className="amenity">💼 Business Center</span>
              <span className="amenity">🏋️ Fitness Center</span>
            </div>
          </div>

          <div className="booking-section">
            <button
              className="book-now-btn"
              onClick={handleBookNow}
            >
              {bookingPreferences ? (
                `Book Now - ₹${(() => {
                  const checkInDate = new Date(bookingPreferences.checkIn);
                  const checkOutDate = new Date(bookingPreferences.checkOut);
                  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
                  const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                  const pricePerNight = parseInt(hotel.cheapestPrice) || 0;
                  const totalCost = pricePerNight * nights * bookingPreferences.rooms;
                  console.log('Book Now Button Calculation:', {
                    pricePerNight,
                    nights,
                    rooms: bookingPreferences.rooms,
                    totalCost
                  });
                  return totalCost.toLocaleString();
                })()} Total`
              ) : (
                `Book Now - ₹${hotel.cheapestPrice}/night`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
