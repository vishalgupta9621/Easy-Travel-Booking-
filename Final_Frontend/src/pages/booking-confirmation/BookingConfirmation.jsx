import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, pointsEarned } = location.state || {};
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!booking) {
      navigate('/travel');
    }
  }, [booking, navigate]);

  if (!booking) {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTravelTypeIcon = (type) => {
    const icons = {
      flight: '✈️',
      train: '🚂',
      bus: '🚌'
    };
    return icons[type] || '🎫';
  };

  const downloadTicket = () => {
    // In a real application, this would generate and download a PDF ticket
    alert('Ticket download functionality would be implemented here');
  };

  const sendTicketEmail = () => {
    // In a real application, this would send the ticket via email
    alert('Ticket sent to your email address');
  };

  return (
    <div className="booking-confirmation-page">
      <Navbar />
      
      <div className="confirmation-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">✅</div>
          <h1>Booking Confirmed!</h1>
          <p>Your {booking.travelType} has been successfully booked</p>
          <div className="booking-id">
            Booking ID: <strong>{booking.bookingId}</strong>
          </div>
        </div>

        {/* Booking Summary Card */}
        <div className="booking-summary-card">
          <div className="card-header">
            <div className="travel-type">
              <span className="travel-icon">{getTravelTypeIcon(booking.travelType)}</span>
              <span className="travel-label">{booking.travelType.toUpperCase()}</span>
            </div>
            <div className="status-badge confirmed">CONFIRMED</div>
          </div>

          <div className="journey-details">
            <div className="route">
              <div className="origin">
                <div className="location-name">{booking.journey.origin.name}</div>
                <div className="location-code">{booking.journey.origin.code}</div>
                <div className="location-city">{booking.journey.origin.city}</div>
              </div>
              
              <div className="route-line">
                <div className="route-arrow">→</div>
              </div>
              
              <div className="destination">
                <div className="location-name">{booking.journey.destination.name}</div>
                <div className="location-code">{booking.journey.destination.code}</div>
                <div className="location-city">{booking.journey.destination.city}</div>
              </div>
            </div>

            <div className="timing">
              <div className="departure">
                <div className="time">{formatTime(booking.journey.departureTime)}</div>
                <div className="date">{formatDate(booking.journey.departureDate)}</div>
              </div>
              <div className="arrival">
                <div className="time">{formatTime(booking.journey.arrivalTime)}</div>
                <div className="date">{formatDate(booking.journey.arrivalDate)}</div>
              </div>
            </div>
          </div>

          <div className="passenger-info">
            <h3>Passengers ({booking.passengers.length})</h3>
            <div className="passengers-list">
              {booking.passengers.map((passenger, index) => (
                <div key={index} className="passenger">
                  <span className="passenger-name">
                    {passenger.title} {passenger.firstName} {passenger.lastName}
                  </span>
                  <span className="passenger-details">
                    Age: {passenger.age} | {passenger.gender}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="booking-details">
            <div className="detail-row">
              <span className="label">Total Amount Paid:</span>
              <span className="value amount">₹{booking.pricing.totalAmount.toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="label">Payment Method:</span>
              <span className="value">{booking.payment.method.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div className="detail-row">
              <span className="label">Transaction ID:</span>
              <span className="value">{booking.payment.transactionId}</span>
            </div>
            {booking.bookingDetails.class && (
              <div className="detail-row">
                <span className="label">Class:</span>
                <span className="value">{booking.bookingDetails.class.toUpperCase()}</span>
              </div>
            )}
            {booking.bookingDetails.trainClass && (
              <div className="detail-row">
                <span className="label">Train Class:</span>
                <span className="value">{booking.bookingDetails.trainClass}</span>
              </div>
            )}
          </div>

          {pointsEarned > 0 && (
            <div className="loyalty-points">
              <div className="points-icon">🎉</div>
              <div className="points-text">
                <strong>Congratulations!</strong> You earned {pointsEarned} loyalty points
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-secondary" onClick={downloadTicket}>
            📄 Download Ticket
          </button>
          <button className="btn-secondary" onClick={sendTicketEmail}>
            📧 Email Ticket
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>

        {/* Detailed Information */}
        {showDetails && (
          <div className="detailed-info">
            <div className="info-section">
              <h3>Contact Information</h3>
              <div className="contact-details">
                <div className="contact-item">
                  <span className="label">Email:</span>
                  <span className="value">{booking.contact.email}</span>
                </div>
                <div className="contact-item">
                  <span className="label">Phone:</span>
                  <span className="value">{booking.contact.phone}</span>
                </div>
                {booking.contact.emergencyContact?.name && (
                  <div className="contact-item">
                    <span className="label">Emergency Contact:</span>
                    <span className="value">
                      {booking.contact.emergencyContact.name} - {booking.contact.emergencyContact.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="info-section">
              <h3>Important Information</h3>
              <div className="important-info">
                <div className="info-item">
                  <strong>Check-in:</strong> Please arrive at least 2 hours before departure for flights, 
                  30 minutes for trains and buses.
                </div>
                <div className="info-item">
                  <strong>ID Proof:</strong> Carry a valid government-issued photo ID for verification.
                </div>
                <div className="info-item">
                  <strong>Cancellation:</strong> Check cancellation policy for refund terms and conditions.
                </div>
                <div className="info-item">
                  <strong>Support:</strong> For any assistance, contact our 24/7 customer support.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="next-steps">
          <h3>What's Next?</h3>
          <div className="steps-grid">
            <div className="step">
              <div className="step-icon">📧</div>
              <div className="step-content">
                <h4>Check Your Email</h4>
                <p>Booking confirmation and e-ticket sent to {booking.contact.email}</p>
              </div>
            </div>
            <div className="step">
              <div className="step-icon">📱</div>
              <div className="step-content">
                <h4>Save Booking Details</h4>
                <p>Keep your booking ID handy for easy check-in and support</p>
              </div>
            </div>
            <div className="step">
              <div className="step-icon">🎫</div>
              <div className="step-content">
                <h4>Prepare for Travel</h4>
                <p>Arrive early with valid ID and enjoy your journey</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Links */}
        <div className="action-links">
          <button 
            className="btn-primary"
            onClick={() => navigate('/my-bookings')}
          >
            View All Bookings
          </button>
          <button 
            className="btn-outline"
            onClick={() => navigate('/travel')}
          >
            Book Another Trip
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingConfirmation;
