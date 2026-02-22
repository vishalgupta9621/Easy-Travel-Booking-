import React, { useState, useEffect } from 'react';

const BookingDebug = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId] = useState('688e504c39f0aa6cf44ca1b3'); // Test user ID

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('Fetching bookings for user:', userId);
      
      const response = await fetch(`http://localhost:8800/api/v1/bookings/user/${userId}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      
      const bookingsData = data.data || [];
      console.log('Bookings array:', bookingsData);
      console.log('Total bookings:', bookingsData.length);
      
      // Log booking types breakdown
      const typeBreakdown = bookingsData.reduce((acc, booking) => {
        const type = booking.bookingType || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      console.log('Booking types breakdown:', typeBreakdown);
      
      // Log first few bookings for inspection
      console.log('First 5 bookings:', bookingsData.slice(0, 5));
      
      setBookings(bookingsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBookingTypeBreakdown = () => {
    return bookings.reduce((acc, booking) => {
      const type = booking.bookingType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  };

  const renderBookingCard = (booking) => {
    const getServiceName = () => {
      switch (booking.bookingType) {
        case 'hotel':
          return booking.itemDetails?.name || 'Hotel Booking';
        case 'flight':
          return booking.itemDetails?.airline?.name 
            ? `${booking.itemDetails.airline.name} ${booking.itemDetails.flightNumber || ''}`
            : 'Flight Booking';
        case 'train':
          return booking.itemDetails?.trainName
            ? `${booking.itemDetails.trainName} (${booking.itemDetails.trainNumber || ''})`
            : 'Train Booking';
        case 'bus':
          return booking.itemDetails?.operator?.name
            ? `${booking.itemDetails.operator.name} - ${booking.itemDetails.busNumber || ''}`
            : 'Bus Booking';
        default:
          return 'Unknown Booking';
      }
    };

    const getRouteInfo = () => {
      if (booking.itemDetails?.route) {
        const origin = booking.itemDetails.route.origin?.city || booking.itemDetails.route.origin?.name || 'Unknown';
        const destination = booking.itemDetails.route.destination?.city || booking.itemDetails.route.destination?.name || 'Unknown';
        return `${origin} → ${destination}`;
      }
      return null;
    };

    return (
      <div key={booking._id} style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        margin: '10px 0',
        backgroundColor: booking.bookingType === 'hotel' ? '#f0f8ff' : '#fff8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4>Booking #{booking.bookingNumber}</h4>
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: booking.bookingType === 'hotel' ? '#e3f2fd' : '#fff3e0',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            {booking.bookingType}
          </span>
        </div>
        
        <div><strong>Service:</strong> {getServiceName()}</div>
        {getRouteInfo() && <div><strong>Route:</strong> {getRouteInfo()}</div>}
        <div><strong>Amount:</strong> ₹{booking.totalAmount}</div>
        <div><strong>Date:</strong> {new Date(booking.travelDate).toLocaleDateString()}</div>
        <div><strong>Status:</strong> {booking.bookingStatus}</div>
        
        <details style={{ marginTop: '10px' }}>
          <summary>Raw Data</summary>
          <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '200px' }}>
            {JSON.stringify(booking, null, 2)}
          </pre>
        </details>
      </div>
    );
  };

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  const typeBreakdown = getBookingTypeBreakdown();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Booking Debug Page</h1>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>Summary</h3>
        <p><strong>Total Bookings:</strong> {bookings.length}</p>
        <p><strong>Breakdown by Type:</strong></p>
        <ul>
          {Object.entries(typeBreakdown).map(([type, count]) => (
            <li key={type}>
              <strong>{type}:</strong> {count} booking{count !== 1 ? 's' : ''}
            </li>
          ))}
        </ul>
      </div>

      <button 
        onClick={fetchBookings}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Refresh Data
      </button>

      <div>
        <h3>All Bookings</h3>
        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          bookings.map(renderBookingCard)
        )}
      </div>
    </div>
  );
};

export default BookingDebug;
