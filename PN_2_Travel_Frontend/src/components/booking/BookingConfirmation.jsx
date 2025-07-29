import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const { bookingNumber } = useParams();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingConfirmation();
  }, [bookingNumber]);

  const loadBookingConfirmation = () => {
    const confirmation = localStorage.getItem('bookingConfirmation');
    if (confirmation) {
      const data = JSON.parse(confirmation);
      if (data.bookingNumber === bookingNumber) {
        setBookingData(data);
      }
    }
    setLoading(false);
  };

  const downloadTicket = () => {
    // In a real app, this would generate and download a PDF ticket
    alert('Ticket download functionality will be implemented soon!');
  };

  const sendToEmail = () => {
    // In a real app, this would send the ticket to user's email
    alert('Email functionality will be implemented soon!');
  };

  if (loading) {
    return <div className="loading">Loading confirmation...</div>;
  }

  if (!bookingData) {
    return (
      <div className="no-confirmation">
        <h2>Booking confirmation not found</h2>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const getItemName = () => {
    const { item, type } = bookingData;
    switch (type) {
      case 'hotel': return item.name;
      case 'flight': return `${item.airline?.name} ${item.flightNumber}`;
      case 'train': return `${item.trainName} (${item.trainNumber})`;
      case 'bus': return `${item.operator} - ${item.busNumber}`;
      case 'package': return item.name;
      default: return 'Unknown';
    }
  };

  return (
    <div className="booking-confirmation">
      <div className="confirmation-header">
        <div className="success-icon">✅</div>
        <h1>Booking Confirmed!</h1>
        <p>Your booking has been successfully confirmed</p>
      </div>

      <div className="confirmation-content">
        <div className="booking-info">
          <div className="booking-number">
            <h2>Booking Number</h2>
            <div className="number">{bookingData.bookingNumber}</div>
          </div>

          <div className="booking-details">
            <h3>Booking Details</h3>
            <div className="detail-row">
              <span>Type:</span>
              <span>{bookingData.type}</span>
            </div>
            <div className="detail-row">
              <span>Item:</span>
              <span>{getItemName()}</span>
            </div>
            <div className="detail-row">
              <span>Amount Paid:</span>
              <span>₹{bookingData.paymentData.amount}</span>
            </div>
            <div className="detail-row">
              <span>Payment Method:</span>
              <span>{bookingData.paymentData.method}</span>
            </div>
            <div className="detail-row">
              <span>Payment ID:</span>
              <span>{bookingData.paymentData.paymentId}</span>
            </div>
            <div className="detail-row">
              <span>Booking Date:</span>
              <span>{new Date(bookingData.bookedAt).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span>Status:</span>
              <span className="status-confirmed">Confirmed</span>
            </div>
          </div>

          {renderItemSpecificDetails()}
        </div>

        <div className="confirmation-actions">
          <button className="download-btn" onClick={downloadTicket}>
            📄 Download Ticket
          </button>
          <button className="email-btn" onClick={sendToEmail}>
            📧 Send to Email
          </button>
          <button className="home-btn" onClick={() => navigate('/')}>
            🏠 Go to Home
          </button>
        </div>
      </div>
    </div>
  );

  function renderItemSpecificDetails() {
    const { item, type } = bookingData;

    switch (type) {
      case 'flight':
        return (
          <div className="flight-ticket-info">
            <h3>Flight Information</h3>
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
              <span>Aircraft:</span>
              <span>{item.aircraft?.model}</span>
            </div>
          </div>
        );

      case 'train':
        return (
          <div className="train-ticket-info">
            <h3>Train Information</h3>
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
          </div>
        );

      case 'bus':
        return (
          <div className="bus-ticket-info">
            <h3>Bus Information</h3>
            <div className="detail-row">
              <span>Route:</span>
              <span>{item.route?.origin?.city} → {item.route?.destination?.city}</span>
            </div>
            <div className="detail-row">
              <span>Departure:</span>
              <span>{item.schedule?.departureTime}</span>
            </div>
            <div className="detail-row">
              <span>Bus Type:</span>
              <span>{item.busType}</span>
            </div>
          </div>
        );

      case 'hotel':
        return (
          <div className="hotel-booking-info">
            <h3>Hotel Information</h3>
            <div className="detail-row">
              <span>Location:</span>
              <span>{item.city}</span>
            </div>
            <div className="detail-row">
              <span>Rating:</span>
              <span>⭐ {item.rating}</span>
            </div>
          </div>
        );

      case 'package':
        return (
          <div className="package-booking-info">
            <h3>Package Information</h3>
            <div className="detail-row">
              <span>Duration:</span>
              <span>{item.duration} days</span>
            </div>
            <div className="detail-row">
              <span>Destinations:</span>
              <span>{item.destinations?.join(', ')}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  }
};

export default BookingConfirmation;
