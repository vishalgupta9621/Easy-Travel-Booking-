import React, { useState, useEffect } from 'react';

const SimpleBookingTest = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:8800/api/v1/bookings/user/688e504c39f0aa6cf44ca1b3');
      const data = await response.json();
      setBookings(data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Simple Booking Test</h1>
      <p>Total bookings: {bookings.length}</p>
      
      {bookings.map((booking, index) => (
        <div key={booking._id || index} style={{
          border: '2px solid',
          borderColor: booking.bookingType === 'hotel' ? 'blue' : 
                      booking.bookingType === 'flight' ? 'green' :
                      booking.bookingType === 'train' ? 'orange' :
                      booking.bookingType === 'bus' ? 'purple' : 'red',
          margin: '10px 0',
          padding: '15px',
          backgroundColor: booking.bookingType === 'hotel' ? '#e3f2fd' : 
                          booking.bookingType === 'flight' ? '#e8f5e8' :
                          booking.bookingType === 'train' ? '#fff3e0' :
                          booking.bookingType === 'bus' ? '#f3e5f5' : '#ffebee'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'black' }}>
            {booking.bookingType?.toUpperCase() || 'UNKNOWN'} - #{booking.bookingNumber}
          </h3>
          
          <div><strong>Type:</strong> {booking.bookingType}</div>
          <div><strong>Amount:</strong> ₹{booking.totalAmount}</div>
          
          {booking.bookingType === 'hotel' && (
            <div><strong>Hotel:</strong> {booking.itemDetails?.name}</div>
          )}
          
          {booking.bookingType === 'flight' && (
            <div><strong>Flight:</strong> {booking.itemDetails?.airline?.name} {booking.itemDetails?.flightNumber}</div>
          )}
          
          {booking.bookingType === 'train' && (
            <div><strong>Train:</strong> {booking.itemDetails?.trainName} ({booking.itemDetails?.trainNumber})</div>
          )}
          
          {booking.bookingType === 'bus' && (
            <div><strong>Bus:</strong> {booking.itemDetails?.operator?.name} - {booking.itemDetails?.busNumber}</div>
          )}
          
          <div><strong>Date:</strong> {new Date(booking.travelDate).toLocaleDateString()}</div>
          <div><strong>Status:</strong> {booking.bookingStatus}</div>
        </div>
      ))}
    </div>
  );
};

export default SimpleBookingTest;
