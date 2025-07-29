import { useState } from 'react';
import { bookingService } from '../../services/api.service';
import './PaymentPage.css';

const PaymentPage = ({ bookingData: bookingInfo, onPaymentSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('demo');

  const saveBookingToDatabase = async (paymentData) => {
    try {
      // Get user data from localStorage (this is how it's stored in AuthContext)
      const user = JSON.parse(localStorage.getItem('user')) || {};
      
      const bookingData = {
        bookingType: bookingInfo.type,
        itemId: bookingInfo.item._id || 'demo',
        userId: user._id || user.id, // Add userId to associate booking with user
        customerInfo: {
          name: user.name || 'example',
          email: user.email || 'example@example.com',
          phone: user.phone || '9999999999'
        },
        paymentInfo: paymentData,
        travelDate: new Date().toISOString(),
        totalAmount: paymentData.amount
      };

      console.log('Saving booking to database:', bookingData);
      const response = await bookingService.createBooking(bookingData);
      console.log('Booking saved successfully:', response);
      return response;
    } catch (error) {
      console.error('Error saving booking to database:', error);
      // Don't throw error - we still want to show success to user
      return null;
    }
  };

  const calculateDays = () => {
    if (bookingInfo.checkIn && bookingInfo.checkOut) {
      const checkIn = new Date(bookingInfo.checkIn);
      const checkOut = new Date(bookingInfo.checkOut);
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return Math.max(1, daysDiff); // Minimum 1 day
    }
    return 1; // Default to 1 day
  };

  const getItemPrice = () => {
    const { item, type } = bookingInfo;
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
      const rooms = bookingInfo.rooms || 1;
      return basePrice * days * rooms;
    }

    return basePrice;
  };

  const getItemName = () => {
    const { item, type } = bookingInfo;
    switch (type) {
      case 'hotel': return item.name;
      case 'flight': return `${item.airline?.name} ${item.flightNumber}`;
      case 'train': return `${item.trainName} (${item.trainNumber})`;
      case 'bus': return `${item.operator} - ${item.busNumber}`;
      case 'package': return item.name;
      default: return 'Unknown';
    }
  };

  const handleDemoPayment = () => {
    setLoading(true);

    const amount = getItemPrice();

    // Simulate payment processing
    setTimeout(async () => {
      const demoPaymentData = {
        paymentId: 'pay_demo_' + Date.now(),
        orderId: 'order_demo_' + Date.now(),
        signature: 'demo_signature',
        amount: amount,
        currency: 'INR',
        method: 'demo',
        status: 'success',
        timestamp: new Date().toISOString()
      };

      // Save booking to database
      await saveBookingToDatabase(demoPaymentData);

      setLoading(false);
      onPaymentSuccess(demoPaymentData);
    }, 2000);
  };

  const handleUPIPayment = () => {
    setLoading(true);

    const amount = getItemPrice();

    // Simulate UPI payment processing
    setTimeout(async () => {
      const upiPaymentData = {
        paymentId: 'upi_' + Date.now(),
        orderId: 'order_upi_' + Date.now(),
        signature: 'upi_signature',
        amount: amount,
        currency: 'INR',
        method: 'upi',
        status: 'success',
        timestamp: new Date().toISOString()
      };

      // Save booking to database
      await saveBookingToDatabase(upiPaymentData);

      setLoading(false);
      onPaymentSuccess(upiPaymentData);
    }, 2500);
  };



  return (
    <div className="payment-page">
      <div className="payment-header">
        <button className="back-btn" onClick={onCancel}>
          ← Back to Details
        </button>
        <h1>Payment</h1>
      </div>

      <div className="payment-content">
        <div className="payment-summary">
          <h3>Payment Summary</h3>
          <div className="summary-item">
            <span>Item:</span>
            <span>{getItemName()}</span>
          </div>
          <div className="summary-item">
            <span>Type:</span>
            <span>{bookingInfo.type}</span>
          </div>
          <div className="summary-item total">
            <span>Total Amount:</span>
            <span>₹{getItemPrice()}</span>
          </div>
        </div>

        <div className="payment-methods">
          <h3>Payment Summary</h3>

          <div className="payment-summary">
            <div className="summary-row">
              <span>Item:</span>
              <span>{getItemName()}</span>
            </div>
            {bookingInfo.type === 'hotel' && (
              <>
                <div className="summary-row">
                  <span>Nights:</span>
                  <span>{calculateDays()}</span>
                </div>
                <div className="summary-row">
                  <span>Rooms:</span>
                  <span>{bookingInfo.rooms || 1}</span>
                </div>
                <div className="summary-row">
                  <span>Guests:</span>
                  <span>{bookingInfo.guests || 1}</span>
                </div>
              </>
            )}
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span>₹{getItemPrice()}</span>
            </div>
          </div>

          <h3>Select Payment Method</h3>
          <div className="payment-options">
            <div
              className={`payment-option ${paymentMethod === 'demo' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('demo')}
            >
              <div className="payment-icon">🎯</div>
              <div className="payment-info">
                <h4>Demo Payment</h4>
                <p>For testing purposes</p>
              </div>
            </div>

            <div
              className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('upi')}
            >
              <div className="payment-icon">📱</div>
              <div className="payment-info">
                <h4>UPI Payment</h4>
                <p>Google Pay, PhonePe, Paytm</p>
              </div>
            </div>
          </div>

          <button
            className="pay-now-btn"
            onClick={() => {
              if (paymentMethod === 'upi') handleUPIPayment();
              else handleDemoPayment();
            }}
            disabled={loading}
          >
            {loading ? 'Processing Payment...' : `Pay ₹${getItemPrice()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
