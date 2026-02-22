import { useState } from 'react';
import './BookingOptionsModal.css';

const BookingOptionsModal = ({ isOpen, onClose, onConfirm, hotel }) => {
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1
  });

  const [errors, setErrors] = useState({});

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get tomorrow's date as minimum checkout
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const validateForm = () => {
    const newErrors = {};

    if (!bookingData.checkIn) {
      newErrors.checkIn = 'Check-in date is required';
    }

    if (!bookingData.checkOut) {
      newErrors.checkOut = 'Check-out date is required';
    }

    if (bookingData.checkIn && bookingData.checkOut) {
      const checkInDate = new Date(bookingData.checkIn);
      const checkOutDate = new Date(bookingData.checkOut);
      
      if (checkOutDate <= checkInDate) {
        newErrors.checkOut = 'Check-out must be after check-in date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm(bookingData);
    }
  };

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Auto-set checkout date if checkin is selected and checkout is empty
    if (field === 'checkIn' && !bookingData.checkOut) {
      const checkInDate = new Date(value);
      checkInDate.setDate(checkInDate.getDate() + 1);
      const nextDay = checkInDate.toISOString().split('T')[0];
      setBookingData(prev => ({
        ...prev,
        checkOut: nextDay
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select Your Stay Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {hotel && (
          <div className="hotel-preview">
            <h3>{hotel.name}</h3>
            <p>📍 {hotel.city}</p>
            <p className="price">₹{hotel.cheapestPrice}/night</p>
          </div>
        )}

        <div className="modal-content">
          <div className="form-group">
            <label htmlFor="checkIn">Check-in Date</label>
            <input
              type="date"
              id="checkIn"
              value={bookingData.checkIn}
              min={today}
              onChange={(e) => handleInputChange('checkIn', e.target.value)}
              className={errors.checkIn ? 'error' : ''}
            />
            {errors.checkIn && <span className="error-text">{errors.checkIn}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="checkOut">Check-out Date</label>
            <input
              type="date"
              id="checkOut"
              value={bookingData.checkOut}
              min={bookingData.checkIn || tomorrowStr}
              onChange={(e) => handleInputChange('checkOut', e.target.value)}
              className={errors.checkOut ? 'error' : ''}
            />
            {errors.checkOut && <span className="error-text">{errors.checkOut}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="guests">Guests</label>
              <select
                id="guests"
                value={bookingData.guests}
                onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>
                    {num} Guest{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="rooms">Rooms</label>
              <select
                id="rooms"
                value={bookingData.rooms}
                onChange={(e) => handleInputChange('rooms', parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>
                    {num} Room{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {bookingData.checkIn && bookingData.checkOut && (
            <div className="stay-summary">
              <h4>Stay Summary</h4>
              <div className="summary-details">
                <p><strong>Duration:</strong> {
                  (() => {
                    const checkInDate = new Date(bookingData.checkIn);
                    const checkOutDate = new Date(bookingData.checkOut);
                    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
                    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                    console.log('Duration Calculation:', {
                      checkIn: bookingData.checkIn,
                      checkOut: bookingData.checkOut,
                      checkInDate,
                      checkOutDate,
                      timeDiff,
                      nights
                    });
                    return nights;
                  })()
                } night(s)</p>
                <p><strong>Total Guests:</strong> {bookingData.guests}</p>
                <p><strong>Rooms:</strong> {bookingData.rooms}</p>
                {hotel && (
                  <p className="total-price">
                    <strong>Estimated Total: ₹{
                      (() => {
                        const checkInDate = new Date(bookingData.checkIn);
                        const checkOutDate = new Date(bookingData.checkOut);
                        const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
                        const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                        const pricePerNight = parseInt(hotel.cheapestPrice) || 0;
                        const totalCost = pricePerNight * nights * bookingData.rooms;
                        console.log('Modal Total Calculation:', {
                          hotelPrice: hotel.cheapestPrice,
                          pricePerNight,
                          nights,
                          rooms: bookingData.rooms,
                          totalCost,
                          calculation: `${pricePerNight} × ${nights} × ${bookingData.rooms} = ${totalCost}`
                        });
                        return totalCost.toLocaleString();
                      })()
                    }</strong>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-btn" onClick={handleConfirm}>
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingOptionsModal;
