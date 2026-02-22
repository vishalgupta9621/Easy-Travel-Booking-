import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HotelOwnerDashboard.css';

const HotelOwnerDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dashboard data
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  // Check if already logged in
  useEffect(() => {
    const savedEmail = localStorage.getItem('hotelOwnerEmail');
    if (savedEmail) {
      setOwnerEmail(savedEmail);
      setIsLoggedIn(true);
      loadDashboardData(savedEmail);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First, verify that the email exists as a hotel owner
      const hotelsResponse = await fetch(`http://localhost:8800/api/v1/hotel-owner-dashboard/owner/${encodeURIComponent(loginEmail)}/hotels`);
      const hotelsData = await hotelsResponse.json();

      if (hotelsData.hotels && hotelsData.hotels.length > 0) {
        // Valid hotel owner
        setOwnerEmail(loginEmail);
        setIsLoggedIn(true);
        localStorage.setItem('hotelOwnerEmail', loginEmail);
        await loadDashboardData(loginEmail);
      } else {
        setError('No hotels found for this email address. Please check your email or register your hotel first.');
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async (email) => {
    try {
      setLoading(true);
      
      // Load hotels
      const hotelsResponse = await fetch(`http://localhost:8800/api/v1/hotel-owner-dashboard/owner/${encodeURIComponent(email)}/hotels`);
      const hotelsData = await hotelsResponse.json();
      setHotels(hotelsData.hotels || []);

      // Load bookings
      const bookingsResponse = await fetch(`http://localhost:8800/api/v1/hotel-owner-dashboard/owner/${encodeURIComponent(email)}/bookings`);
      const bookingsData = await bookingsResponse.json();
      setBookings(bookingsData.bookings || []);

      // Load stats
      const statsResponse = await fetch(`http://localhost:8800/api/v1/hotel-owner-dashboard/owner/${encodeURIComponent(email)}/stats`);
      const statsData = await statsResponse.json();
      setStats(statsData.stats || {});

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setOwnerEmail('');
    setLoginEmail('');
    setHotels([]);
    setBookings([]);
    setStats({});
    localStorage.removeItem('hotelOwnerEmail');
  };



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ffc107',
      'confirmed': '#28a745',
      'checked_in': '#17a2b8',
      'checked_out': '#6c757d',
      'cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  // Login Form
  if (!isLoggedIn) {
    return (
      <div className="hotel-owner-login">
        <div className="login-container">
          <div className="login-left">
            <div className="login-header">
              <h1>🏨 Hotel Owner Dashboard</h1>
              <p>Access your hotel booking management system</p>
            </div>
          </div>

          <div className="login-right">
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label>Hotel Owner Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your hotel's email address"
                  required
                  className={error ? 'error' : ''}
                />
                <small>Use the same email address that was used when registering your hotel</small>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" disabled={loading} className="login-btn">
                {loading ? 'Verifying...' : 'Access Dashboard'}
              </button>
            </form>

            <div className="login-footer">
              <p>Don't have a hotel registered yet?</p>
              <Link to="/hotel-owner-registration" className="register-link">
                Register Your Hotel
              </Link>
              <br />
              <Link to="/" className="home-link">← Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="hotel-owner-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🏨 Hotel Owner Dashboard</h1>
          <div className="header-info">
            <span>Welcome, {ownerEmail}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        {/* Navigation Tabs */}
        <div className="dashboard-nav">
          <button 
            className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`nav-btn ${activeTab === 'hotels' ? 'active' : ''}`}
            onClick={() => setActiveTab('hotels')}
          >
            🏨 My Hotels
          </button>
          <button 
            className={`nav-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            📋 Bookings
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {loading && <div className="loading">Loading...</div>}

          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Hotels</h3>
                  <div className="stat-value">{hotels.length}</div>
                </div>
                <div className="stat-card">
                  <h3>Total Bookings</h3>
                  <div className="stat-value">{stats.totalBookings || 0}</div>
                </div>
                <div className="stat-card">
                  <h3>Active Bookings</h3>
                  <div className="stat-value">{stats.activeBookings || 0}</div>
                </div>
                <div className="stat-card">
                  <h3>Total Revenue</h3>
                  <div className="stat-value">₹{stats.totalRevenue || 0}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hotels' && (
            <div className="hotels-section">
              <h2>My Hotels</h2>
              <div className="hotels-grid">
                {hotels.map(hotel => (
                  <div key={hotel._id} className="hotel-card">
                    <h3>{hotel.name}</h3>
                    <p><strong>City:</strong> {hotel.city}</p>
                    <p><strong>Address:</strong> {hotel.address}</p>
                    <p><strong>Rating:</strong> ⭐ {hotel.rating}</p>
                    <p><strong>Price:</strong> ₹{hotel.cheapestPrice}/night</p>
                    <div className="hotel-stats">
                      <span>Bookings: {hotel.bookingCount || 0}</span>
                      <span>Active: {hotel.activeBookings || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bookings-section">
              <h2>Hotel Bookings</h2>
              <div className="bookings-table">
                {bookings.length === 0 ? (
                  <p>No bookings found for your hotels.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Guest Name</th>
                        <th>Hotel</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(booking => (
                        <tr key={booking._id}>
                          <td>{booking.bookingNumber}</td>
                          <td>{booking.guestName}</td>
                          <td>{booking.hotelName}</td>
                          <td>{formatDate(booking.checkInDate)}</td>
                          <td>{formatDate(booking.checkOutDate)}</td>
                          <td>₹{booking.totalAmount}</td>
                          <td>
                            <span
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(booking.status) }}
                            >
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelOwnerDashboard;
