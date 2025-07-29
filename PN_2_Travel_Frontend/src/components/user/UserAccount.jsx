import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/api.service';
import './UserAccount.css';

const UserAccount = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Debug: Log the user object
      console.log('User object from context:', user);

      // Get user ID - handle both _id and id properties
      let userId = user?._id || user?.id;

      // If no user ID from context, try localStorage as fallback
      if (!userId) {
        try {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          userId = storedUser._id || storedUser.id;
          console.log('User from localStorage:', storedUser);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }

      if (!userId) {
        console.error('User ID not found. User object:', user);
        console.error('Please log in again to access your account.');
        setLoading(false);
        return;
      }

      console.log('Using user ID:', userId);

      // Load user bookings
      const bookingResponse = await fetch(`http://localhost:8800/api/v1/bookings/user/${userId}`);
      if (bookingResponse.ok) {
        const bookingData = await bookingResponse.json();
        setBookings(bookingData.data || []);
      } else {
        console.error('Failed to load bookings:', bookingResponse.status);
      }

      // Load user payments
      const paymentResponse = await fetch(`http://localhost:8800/api/v1/payments/user/${userId}`);
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        setPayments(paymentData.data || []);
      } else {
        console.error('Failed to load payments:', paymentResponse.status);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="user-account">
        <div className="not-logged-in">
          <h2>Please log in to view your account</h2>
          <p>You need to be logged in to access your bookings and payment history.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="user-account">
        <div className="loading">Loading your account information...</div>
      </div>
    );
  }

  return (
    <div className="user-account">
      <div className="account-header">
        <h1>My Account</h1>
        <div className="user-info">
          <h2>Welcome, {user?.name || user?.firstName || 'User'}!</h2>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="account-tabs">
        <button 
          className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          My Bookings ({bookings.length})
        </button>
        <button 
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payment History ({payments.length})
        </button>
      </div>

      <div className="account-content">
        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h3>Your Bookings</h3>
            {bookings.length === 0 ? (
              <div className="no-data">
                <p>No bookings found. Start planning your next trip!</p>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map((booking) => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-header">
                      <h4>Booking #{booking.bookingNumber}</h4>
                      <span className={`status ${booking.bookingStatus}`}>
                        {booking.bookingStatus}
                      </span>
                    </div>
                    <div className="booking-details">
                      <div className="detail-row">
                        <span>Type:</span>
                        <span>{booking.bookingType}</span>
                      </div>
                      <div className="detail-row">
                        <span>Amount:</span>
                        <span>₹{booking.totalAmount}</span>
                      </div>
                      <div className="detail-row">
                        <span>Date:</span>
                        <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                      {booking.travelDate && (
                        <div className="detail-row">
                          <span>Travel Date:</span>
                          <span>{new Date(booking.travelDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="payments-section">
            <h3>Payment History</h3>
            {payments.length === 0 ? (
              <div className="no-data">
                <p>No payment history found.</p>
              </div>
            ) : (
              <div className="payments-list">
                {payments.map((payment) => (
                  <div key={payment._id} className="payment-card">
                    <div className="payment-header">
                      <h4>Payment #{payment.paymentId}</h4>
                      <span className={`status ${payment.status}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="payment-details">
                      <div className="detail-row">
                        <span>Booking:</span>
                        <span>{payment.bookingNumber}</span>
                      </div>
                      <div className="detail-row">
                        <span>Amount:</span>
                        <span>₹{payment.amount}</span>
                      </div>
                      <div className="detail-row">
                        <span>Method:</span>
                        <span>{payment.method.toUpperCase()}</span>
                      </div>
                      <div className="detail-row">
                        <span>Date:</span>
                        <span>{new Date(payment.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAccount;
