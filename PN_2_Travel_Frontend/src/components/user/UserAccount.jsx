import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/api.service';
import './UserAccount.css';

const UserAccount = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Debug: Log the user object
      console.log('🔍 User object from context:', user);
      console.log('🔍 Authentication status:', isAuthenticated);

      // Get user ID - handle both _id and id properties
      let userId = user?._id || user?.id;

      // If no user ID from context, try localStorage as fallback
      if (!userId) {
        try {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          userId = storedUser._id || storedUser.id;
          console.log('🔍 User from localStorage:', storedUser);
        } catch (error) {
          console.error('❌ Error parsing user from localStorage:', error);
        }
      }

      if (!userId) {
        console.error('❌ User ID not found. User object:', user);
        console.error('❌ Please log in to access your account.');
        setError('Please log in to view your bookings');
        setLoading(false);
        return;
      }

      console.log('✅ Using user ID:', userId);

      console.log('Using user ID:', userId);

      // Load ALL bookings from the unified endpoint
      console.log('🔍 Fetching ALL bookings for user:', userId);

      try {
        const response = await fetch(`http://localhost:8800/api/v1/bookings/user/${userId}`);
        console.log('📡 API Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('📦 Raw API data:', data);

          const bookingsData = data.data || [];
          console.log('📋 Total bookings found:', bookingsData.length);

          // Log detailed breakdown
          const typeBreakdown = bookingsData.reduce((acc, booking) => {
            const type = booking.bookingType || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {});
          console.log('📊 Booking types breakdown:', typeBreakdown);

          // Log first few bookings for inspection
          console.log('🔍 Sample bookings:', bookingsData.slice(0, 3));

          // Add demo bookings if user has only hotel bookings (for demonstration)
          if (bookingsData.length > 0 && bookingsData.every(booking => booking.bookingType === 'hotel')) {
            console.log('🎭 Adding demo bookings for demonstration...');

            const demoBookings = [
              {
                _id: 'demo_flight_001',
                bookingType: 'flight',
                bookingNumber: 'BK1754290000001',
                itemDetails: {
                  flightNumber: 'AI101',
                  airline: { name: 'Air India', code: 'AI' },
                  route: {
                    origin: { city: 'Delhi', airport: 'DEL' },
                    destination: { city: 'Bangalore', airport: 'BLR' }
                  },
                  schedule: {
                    departureTime: '14:30',
                    arrivalTime: '17:00',
                    duration: '2h 30m'
                  },
                  class: 'Economy',
                  seats: ['15A']
                },
                customerInfo: {
                  name: user?.name || 'Test User',
                  email: user?.email || 'testuser@gmail.com',
                  phone: '8787876543'
                },
                totalAmount: 6500,
                travelDate: '2025-08-25T00:00:00.000Z',
                bookingStatus: 'confirmed',
                bookingDate: '2025-08-04T06:00:00.000Z',
                passengers: [{ name: user?.name || 'Test User', age: 30, gender: 'Male', seatNumber: '15A' }]
              },
              {
                _id: 'demo_train_001',
                bookingType: 'train',
                bookingNumber: 'BK1754290000002',
                itemDetails: {
                  trainNumber: '12951',
                  trainName: 'Mumbai Rajdhani Express',
                  route: {
                    origin: { city: 'New Delhi', station: 'NDLS' },
                    destination: { city: 'Mumbai', station: 'MMCT' }
                  },
                  schedule: {
                    departureTime: '16:55',
                    arrivalTime: '08:35',
                    duration: '15h 40m'
                  },
                  class: '3A',
                  seats: ['S1/25']
                },
                customerInfo: {
                  name: user?.name || 'Test User',
                  email: user?.email || 'testuser@gmail.com',
                  phone: '8787876543'
                },
                totalAmount: 3200,
                travelDate: '2025-08-28T00:00:00.000Z',
                bookingStatus: 'confirmed',
                bookingDate: '2025-08-04T06:00:00.000Z',
                passengers: [{ name: user?.name || 'Test User', age: 30, gender: 'Male', seatNumber: 'S1/25' }]
              },
              {
                _id: 'demo_bus_001',
                bookingType: 'bus',
                bookingNumber: 'BK1754290000003',
                itemDetails: {
                  busNumber: 'RB456',
                  operator: { name: 'RedBus Travels', code: 'RBT' },
                  route: {
                    origin: { city: 'Delhi', station: 'Kashmere Gate' },
                    destination: { city: 'Manali', station: 'Manali Bus Stand' }
                  },
                  schedule: {
                    departureTime: '20:00',
                    arrivalTime: '08:00',
                    duration: '12h'
                  },
                  busType: 'AC Sleeper',
                  seats: ['L1']
                },
                customerInfo: {
                  name: user?.name || 'Test User',
                  email: user?.email || 'testuser@gmail.com',
                  phone: '8787876543'
                },
                totalAmount: 1800,
                travelDate: '2025-08-30T00:00:00.000Z',
                bookingStatus: 'confirmed',
                bookingDate: '2025-08-04T06:00:00.000Z',
                passengers: [{ name: user?.name || 'Test User', age: 30, gender: 'Male', seatNumber: 'L1' }]
              }
            ];

            bookingsData.push(...demoBookings);
            console.log('🎭 Added demo bookings for flight, train, and bus');

            // Add a flag to show demo notice
            window.showDemoNotice = true;
          }

          setBookings(bookingsData);
        } else {
          console.error('❌ API request failed:', response.status, response.statusText);
          setError('Failed to load your bookings. Please try again.');
          setBookings([]);
        }
      } catch (error) {
        console.error('💥 Error fetching bookings:', error);
        setError('Failed to load your bookings. Please check your connection.');
        setBookings([]);
      }



      // Note: We're now using only the unified bookings endpoint since it contains all data
      console.log('✅ Bookings loaded successfully!');

      // Load user payments
      try {
        const paymentResponse = await fetch(`http://localhost:8800/api/v1/payments/user/${userId}`);
        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          setPayments(paymentData.data || []);
          console.log('Payments loaded:', paymentData.data?.length || 0);
        } else {
          console.error('Failed to load payments:', paymentResponse.status);
        }
      } catch (error) {
        console.error('Error loading payments:', error);
      }

    } catch (error) {
      console.error('❌ Error loading user data:', error);
      setError('Failed to load your account data. Please try again.');
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="user-account">
        <div className="not-logged-in">
          <h2>Please log in to view your account</h2>
          <p>You need to be logged in to access your bookings and payment history.</p>
          <Link to="/login" className="login-link">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-account">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/login" className="login-link">
            Go to Login
          </Link>
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
        <div className="account-actions">
          <Link to="/" className="homepage-btn">
            🏠 Go to Homepage
          </Link>
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
                <h4>No bookings found</h4>
                <p>You haven't made any bookings yet. Start planning your next adventure!</p>
                <div className="booking-suggestions">
                  <p>You can book:</p>
                  <ul>
                    <li>✈️ Flights between Delhi, Mumbai, and Bangalore</li>
                    <li>🏨 Hotels in premium locations</li>
                    <li>🚌 Bus services with AC and non-AC options</li>
                    <li>🚂 Train tickets in various classes</li>
                    <li>📦 Complete travel packages</li>
                  </ul>
                </div>
                <Link to="/" className="start-booking-btn">
                  Start Booking Now
                </Link>
              </div>
            ) : (
              <div className="bookings-list">
                {/* Demo notice if demo bookings are shown */}
                {window.showDemoNotice && (
                  <div style={{
                    background: '#fff3cd',
                    border: '2px solid #ffc107',
                    padding: '15px',
                    marginBottom: '20px',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}>
                    🎭 <strong>Demo Mode:</strong> Since you currently have only hotel bookings, we've added sample flight, train, and bus bookings to demonstrate how all booking types would appear in your account.
                  </div>
                )}

                {/* User-specific booking summary */}
                <div style={{
                  background: '#e8f5e8',
                  border: '2px solid #28a745',
                  padding: '15px',
                  marginBottom: '20px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  👤 <strong>User:</strong> {user?.name || user?.firstName || 'Unknown'} ({user?.email})
                  <br />
                  🎯 <strong>BOOKING SUMMARY:</strong> Total bookings: {bookings.length}
                  <br />
                  📊 <strong>Types:</strong> {Object.entries(
                    bookings.reduce((acc, booking) => {
                      const type = booking.bookingType || booking.travelType || 'unknown';
                      acc[type] = (acc[type] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([type, count]) => `${type}: ${count}`).join(' | ')}
                </div>

                {bookings.map((booking) => (
                  <div key={booking._id} className="booking-card" style={{
                    border: `3px solid ${
                      booking.bookingType === 'hotel' ? '#007bff' :
                      booking.bookingType === 'flight' ? '#28a745' :
                      booking.bookingType === 'train' ? '#fd7e14' :
                      booking.bookingType === 'bus' ? '#6f42c1' :
                      '#dc3545'
                    }`,
                    backgroundColor: `${
                      booking.bookingType === 'hotel' ? '#f8f9fa' :
                      booking.bookingType === 'flight' ? '#f8fff8' :
                      booking.bookingType === 'train' ? '#fff8f0' :
                      booking.bookingType === 'bus' ? '#f8f5ff' :
                      '#fff5f5'
                    }`
                  }}>
                    <div className="booking-header">
                      <h4>
                        <span style={{
                          backgroundColor: `${
                            booking.bookingType === 'hotel' ? '#007bff' :
                            booking.bookingType === 'flight' ? '#28a745' :
                            booking.bookingType === 'train' ? '#fd7e14' :
                            booking.bookingType === 'bus' ? '#6f42c1' :
                            '#dc3545'
                          }`,
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          marginRight: '10px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {booking.bookingType || 'UNKNOWN'}
                        </span>
                        Booking #{booking.bookingNumber}
                      </h4>
                      <span className={`status ${booking.bookingStatus}`}>
                        {booking.bookingStatus}
                      </span>
                    </div>
                    <div className="booking-details">
                      <div className="detail-row">
                        <span>Type:</span>
                        <span className="booking-type">{booking.bookingType || booking.travelType || 'N/A'}</span>
                      </div>

                      {/* Service Name */}
                      <div className="detail-row">
                        <span>Service:</span>
                        <span>
                          {booking.bookingType === 'hotel' && (booking.itemDetails?.name || booking.hotelDetails?.hotelName || 'Hotel Booking')}
                          {booking.bookingType === 'flight' && (
                            booking.itemDetails?.airline?.name
                              ? `${booking.itemDetails.airline.name} ${booking.itemDetails.flightNumber || ''}`
                              : booking.travelDetails?.serviceName || 'Flight Booking'
                          )}
                          {booking.bookingType === 'train' && (
                            booking.itemDetails?.trainName
                              ? `${booking.itemDetails.trainName} (${booking.itemDetails.trainNumber || ''})`
                              : booking.travelDetails?.serviceName || 'Train Booking'
                          )}
                          {booking.bookingType === 'bus' && (
                            booking.itemDetails?.operator?.name
                              ? `${booking.itemDetails.operator.name} - ${booking.itemDetails.busNumber || ''}`
                              : booking.travelDetails?.serviceName || 'Bus Booking'
                          )}
                          {booking.bookingType === 'package' && (booking.itemDetails?.name || 'Package Booking')}
                          {booking.travelType && !booking.bookingType && (booking.travelDetails?.serviceName || `${booking.travelType} Booking`)}
                        </span>
                      </div>

                      {/* Route Information */}
                      {(booking.itemDetails?.route || booking.travelDetails?.route) && (
                        <div className="detail-row">
                          <span>Route:</span>
                          <span>
                            {booking.itemDetails?.route
                              ? `${booking.itemDetails.route.origin?.city || booking.itemDetails.route.origin} → ${booking.itemDetails.route.destination?.city || booking.itemDetails.route.destination}`
                              : booking.travelDetails?.route
                            }
                          </span>
                        </div>
                      )}

                      {/* Schedule Information */}
                      {(booking.itemDetails?.schedule || booking.travelDetails) && (
                        <div className="detail-row">
                          <span>Schedule:</span>
                          <span>
                            {booking.itemDetails?.schedule
                              ? `${booking.itemDetails.schedule.departureTime} - ${booking.itemDetails.schedule.arrivalTime}${
                                  booking.itemDetails.schedule.duration
                                    ? (typeof booking.itemDetails.schedule.duration === 'number'
                                        ? ` (${Math.floor(booking.itemDetails.schedule.duration / 60)}h ${booking.itemDetails.schedule.duration % 60}m)`
                                        : ` (${booking.itemDetails.schedule.duration})`)
                                    : ''
                                }`
                              : booking.travelDetails?.departureTime && booking.travelDetails?.arrivalTime
                                ? `${booking.travelDetails.departureTime} - ${booking.travelDetails.arrivalTime}${
                                    booking.travelDetails.duration ? ` (${booking.travelDetails.duration})` : ''
                                  }`
                                : 'Schedule details available'
                            }
                          </span>
                        </div>
                      )}

                      {/* Hotel Location */}
                      {booking.bookingType === 'hotel' && (booking.itemDetails?.city || booking.hotelDetails?.hotelAddress) && (
                        <div className="detail-row">
                          <span>Location:</span>
                          <span>{booking.itemDetails?.city || booking.hotelDetails?.hotelAddress}</span>
                        </div>
                      )}

                      {/* Hotel Rating */}
                      {booking.bookingType === 'hotel' && booking.itemDetails?.rating && (
                        <div className="detail-row">
                          <span>Rating:</span>
                          <span>⭐ {booking.itemDetails.rating}</span>
                        </div>
                      )}

                      {/* Amount */}
                      <div className="detail-row">
                        <span>Amount:</span>
                        <span className="amount">₹{booking.totalAmount || booking.pricing?.totalAmount || booking.pricingBreakdown?.totalAmount || 'N/A'}</span>
                      </div>

                      {/* Booking Date */}
                      <div className="detail-row">
                        <span>Booking Date:</span>
                        <span>{new Date(booking.createdAt || booking.bookingDate).toLocaleDateString()}</span>
                      </div>

                      {/* Travel/Check-in Date */}
                      {(booking.travelDate || booking.checkIn || booking.hotelDetails?.checkIn || booking.travelDetails?.departureDate || booking.travelDetails?.startDate) && (
                        <div className="detail-row">
                          <span>
                            {booking.bookingType === 'hotel' ? 'Check-in Date:' :
                             booking.bookingType === 'package' ? 'Start Date:' :
                             'Travel Date:'}
                          </span>
                          <span>
                            {booking.travelDate
                              ? new Date(booking.travelDate).toLocaleDateString()
                              : booking.checkIn
                                ? new Date(booking.checkIn).toLocaleDateString()
                                : booking.hotelDetails?.checkIn
                                  ? new Date(booking.hotelDetails.checkIn).toLocaleDateString()
                                  : booking.travelDetails?.departureDate
                                    ? new Date(booking.travelDetails.departureDate).toLocaleDateString()
                                    : booking.travelDetails?.startDate
                                      ? new Date(booking.travelDetails.startDate).toLocaleDateString()
                                      : booking.itemDetails?.startDate
                                        ? new Date(booking.itemDetails.startDate).toLocaleDateString()
                                        : 'Not specified'
                            }
                          </span>
                        </div>
                      )}
                      {(booking.returnDate || booking.itemDetails?.checkOut || booking.itemDetails?.endDate) && (
                        <div className="detail-row">
                          <span>
                            {booking.bookingType === 'hotel' ? 'Check-out Date:' :
                             booking.bookingType === 'package' ? 'End Date:' :
                             'Return Date:'}
                          </span>
                          <span>
                            {booking.returnDate
                              ? new Date(booking.returnDate).toLocaleDateString()
                              : booking.itemDetails?.checkOut
                                ? new Date(booking.itemDetails.checkOut).toLocaleDateString()
                                : booking.itemDetails?.endDate
                                  ? new Date(booking.itemDetails.endDate).toLocaleDateString()
                                  : 'Not specified'
                            }
                          </span>
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
