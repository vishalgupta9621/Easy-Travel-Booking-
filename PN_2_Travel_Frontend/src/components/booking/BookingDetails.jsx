import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PaymentPage from './PaymentPage';
import './BookingDetails.css';

const BookingDetails = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingData();
  }, [type, id]);

  const loadBookingData = () => {
    // Get booking data from localStorage (in real app, fetch from API)
    const pendingBooking = localStorage.getItem('pendingBooking');
    if (pendingBooking) {
      const data = JSON.parse(pendingBooking);

      // Add booking dates if not present (for calculation)
      if (!data.checkIn && !data.checkOut) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        data.checkIn = today.toISOString().split('T')[0];
        data.checkOut = tomorrow.toISOString().split('T')[0];
      }

      setBookingData(data);
    }
    setLoading(false);
  };

  const handleProceedToPayment = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    // Handle successful payment
    console.log('Payment successful:', paymentData);
    
    // Generate booking number
    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Store booking confirmation
    const bookingConfirmation = {
      bookingNumber,
      ...bookingData,
      paymentData,
      status: 'confirmed',
      bookedAt: new Date().toISOString()
    };
    
    localStorage.setItem('bookingConfirmation', JSON.stringify(bookingConfirmation));
    localStorage.removeItem('pendingBooking');
    
    // Navigate to confirmation page
    navigate(`/booking/confirmation/${bookingNumber}`);
  };

  if (loading) {
    return <div className="loading">Loading booking details...</div>;
  }

  if (!bookingData) {
    return (
      <div className="no-booking">
        <h2>No booking data found</h2>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  if (showPayment) {
    return (
      <PaymentPage 
        bookingData={bookingData}
        onPaymentSuccess={handlePaymentSuccess}
        onCancel={() => setShowPayment(false)}
      />
    );
  }

  return (
    <div className="booking-details">
      <div className="booking-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Search
        </button>
        <h1>Booking Details</h1>
      </div>



      <div className="booking-content">
        <div className="booking-item-details">
          {renderBookingDetails()}
        </div>

        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-item">
            <span>Item Type:</span>
            <span>{bookingData.type}</span>
          </div>
          <div className="summary-item">
            <span>Item Name:</span>
            <span>{getItemName()}</span>
          </div>
          <div className="summary-item">
            <span>Price:</span>
            <span>₹{getItemPrice().toLocaleString()}</span>
          </div>
          <div className="summary-item total">
            <span>Total Amount:</span>
            <span>₹{getItemPrice().toLocaleString()}</span>
          </div>
          
          <button 
            className="proceed-payment-btn"
            onClick={handleProceedToPayment}
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );

  function renderBookingDetails() {
    const { item, type } = bookingData;

    switch (type) {
      case 'hotel':
        return (
          <div className="hotel-details">
            <h2>{item.name}</h2>
            <div className="detail-row">
              <span>Location:</span>
              <span>{item.city}</span>
            </div>
            <div className="detail-row">
              <span>Rating:</span>
              <span>⭐ {item.rating}</span>
            </div>
            <div className="detail-row">
              <span>Check-in:</span>
              <span>{bookingData.checkIn || 'Today'}</span>
            </div>
            <div className="detail-row">
              <span>Check-out:</span>
              <span>{bookingData.checkOut || 'Tomorrow'}</span>
            </div>
            <div className="detail-row">
              <span>Number of nights:</span>
              <span>{calculateDays()} night{calculateDays() > 1 ? 's' : ''}</span>
            </div>
            <div className="detail-row">
              <span>Number of rooms:</span>
              <span>{bookingData.rooms || 1} room{(bookingData.rooms || 1) > 1 ? 's' : ''}</span>
            </div>
            <div className="detail-row">
              <span>Number of guests:</span>
              <span>{bookingData.guests || 1} guest{(bookingData.guests || 1) > 1 ? 's' : ''}</span>
            </div>
            <div className="detail-row">
              <span>Price per night (per room):</span>
              <span>₹{parseInt(item.cheapestPrice || 0).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span>Description:</span>
              <span>{item.desc}</span>
            </div>
          </div>
        );

      case 'flight':
        return (
          <div className="flight-details">
            <h2>{item.airline?.name} {item.flightNumber}</h2>
            <div className="detail-row">
              <span>Route:</span>
              <span>{item.route?.origin?.city} → {item.route?.destination?.city}</span>
            </div>
            <div className="detail-row">
              <span>Departure:</span>
              <span>{item.schedule?.departureTime}</span>
            </div>
            <div className="detail-row">
              <span>Arrival:</span>
              <span>{item.schedule?.arrivalTime}</span>
            </div>
            <div className="detail-row">
              <span>Duration:</span>
              <span>{Math.floor(item.schedule?.duration / 60)}h {item.schedule?.duration % 60}m</span>
            </div>
            <div className="detail-row">
              <span>Aircraft:</span>
              <span>{item.aircraft?.model}</span>
            </div>
          </div>
        );

      case 'train':
        return (
          <div className="train-details">
            <h2>{item.trainName} ({item.trainNumber})</h2>
            <div className="detail-row">
              <span>Route:</span>
              <span>{item.route?.origin?.city} → {item.route?.destination?.city}</span>
            </div>
            <div className="detail-row">
              <span>Departure:</span>
              <span>{item.schedule?.departureTime}</span>
            </div>
            <div className="detail-row">
              <span>Arrival:</span>
              <span>{item.schedule?.arrivalTime}</span>
            </div>
            <div className="detail-row">
              <span>Duration:</span>
              <span>{Math.floor(item.schedule?.duration / 60)}h {item.schedule?.duration % 60}m</span>
            </div>
          </div>
        );

      case 'bus':
        return (
          <div className="bus-details">
            <h2>{item.operator} - {item.busNumber}</h2>
            <div className="detail-row">
              <span>Route:</span>
              <span>{item.route?.origin?.city} → {item.route?.destination?.city}</span>
            </div>
            <div className="detail-row">
              <span>Departure:</span>
              <span>{item.schedule?.departureTime}</span>
            </div>
            <div className="detail-row">
              <span>Arrival:</span>
              <span>{item.schedule?.arrivalTime}</span>
            </div>
            <div className="detail-row">
              <span>Bus Type:</span>
              <span>{item.busType}</span>
            </div>
          </div>
        );

      case 'package':
        return (
          <div className="package-details">
            <h2>{item.name}</h2>
            <div className="detail-row">
              <span>Duration:</span>
              <span>{item.duration} days</span>
            </div>
            <div className="detail-row">
              <span>Destinations:</span>
              <span>{item.destinations?.join(', ')}</span>
            </div>
            <div className="detail-row">
              <span>Type:</span>
              <span>{item.type}</span>
            </div>
            <div className="detail-row">
              <span>Description:</span>
              <span>{item.description}</span>
            </div>
          </div>
        );

      default:
        return <div>Unknown booking type</div>;
    }
  }

  function getItemName() {
    const { item, type } = bookingData;
    switch (type) {
      case 'hotel': return item.name;
      case 'flight': return `${item.airline?.name} ${item.flightNumber}`;
      case 'train': return `${item.trainName} (${item.trainNumber})`;
      case 'bus': return `${item.operator} - ${item.busNumber}`;
      case 'package': return item.name;
      default: return 'Unknown';
    }
  }

  function calculateDays() {
    if (bookingData.checkIn && bookingData.checkOut) {
      const checkIn = new Date(bookingData.checkIn);
      const checkOut = new Date(bookingData.checkOut);
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return Math.max(1, daysDiff); // Minimum 1 day
    }
    return 1; // Default to 1 day
  }

  function getItemPrice() {
    const { item, type } = bookingData;
    const basePrice = (() => {
      switch (type) {
        case 'hotel': return item.cheapestPrice || 0;
        case 'flight': return item.pricing?.economy?.basePrice || 0;
        case 'train': return item.pricing?.sleeper?.basePrice || 0;
        case 'bus': return item.pricing?.economy?.basePrice || 0;
        case 'package': return item.price || 0;
        default: return 0;
      }
    })();

    // For hotels, multiply by number of days and rooms
    if (type === 'hotel') {
      const days = calculateDays();
      const rooms = bookingData.rooms || 1;
      const totalPrice = basePrice * days * rooms;
      console.log('BookingDetails - Hotel Price Calculation:', {
        basePrice,
        days,
        rooms,
        totalPrice,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        calculation: `${basePrice} × ${days} × ${rooms} = ${totalPrice}`
      });
      return totalPrice;
    }

    return basePrice;
  }
};

export default BookingDetails;
