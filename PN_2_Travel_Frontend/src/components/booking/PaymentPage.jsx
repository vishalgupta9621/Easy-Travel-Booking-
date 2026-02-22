import { useState } from 'react';
import { bookingService } from '../../services/api.service';
import './PaymentPage.css';

const PaymentPage = ({ bookingData: bookingInfo, onPaymentSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isDemoMode, setIsDemoMode] = useState(false);

  const saveBookingToDatabase = async (paymentData) => {
    try {
      // Get user data from localStorage (this is how it's stored in AuthContext)
      const user = JSON.parse(localStorage.getItem('user')) || {};
      
      const bookingData = {
        bookingType: bookingInfo.type,
        itemId: bookingInfo.item._id || 'demo',
        userId: user._id || user.id, // Add userId to associate booking with user
        customerInfo: {
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Guest User',
          email: user.email || 'example@example.com',
          phone: user.phone || '9999999999'
        },
        paymentInfo: paymentData,
        travelDate: bookingInfo.checkIn || bookingInfo.departure || bookingInfo.startDate || bookingInfo.travelDate || new Date().toISOString(),
        returnDate: bookingInfo.checkOut || bookingInfo.return || bookingInfo.endDate || bookingInfo.returnDate,
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
      const totalPrice = basePrice * days * rooms;
      console.log('PaymentPage - Hotel Price Calculation:', {
        basePrice,
        days,
        rooms,
        totalPrice,
        checkIn: bookingInfo.checkIn,
        checkOut: bookingInfo.checkOut,
        calculation: `${basePrice} × ${days} × ${rooms} = ${totalPrice}`
      });
      return totalPrice;
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

  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);
      const amount = getItemPrice();
      const user = JSON.parse(localStorage.getItem('user')) || {};

      // Generate booking number for this payment
      const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Create Razorpay order
      const orderResponse = await fetch('http://localhost:8800/api/v1/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'INR',
          bookingNumber: bookingNumber,
          customerInfo: {
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Guest User',
            email: user.email || 'guest@example.com',
            phone: user.phone || '9999999999'
          }
        })
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      // If in demo mode, simulate payment
      if (orderData.isDemoMode) {
        console.log('Demo mode detected, simulating payment...');
        setIsDemoMode(true);
        setTimeout(async () => {
          const demoPaymentData = {
            paymentId: `pay_demo_${Date.now()}`,
            orderId: orderData.order.id,
            signature: `demo_signature_${Date.now()}`,
            amount: amount,
            currency: 'INR',
            method: 'razorpay',
            status: 'success',
            timestamp: new Date().toISOString()
          };

          await saveBookingToDatabase(demoPaymentData);
          setLoading(false);
          onPaymentSuccess(demoPaymentData);
        }, 2000);
        return;
      }

      // Configure Razorpay options
      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Travel Bookings',
        description: `Booking for ${getItemName()}`,
        order_id: orderData.order.id,
        config: {
          display: {
            blocks: {
              banks: {
                name: 'Pay using Netbanking',
                instruments: [
                  {
                    method: 'netbanking'
                  }
                ]
              },
              card: {
                name: 'Pay using Cards',
                instruments: [
                  {
                    method: 'card'
                  }
                ]
              },
              upi: {
                name: 'Pay using UPI',
                instruments: [
                  {
                    method: 'upi'
                  }
                ]
              },
              wallet: {
                name: 'Pay using Wallets',
                instruments: [
                  {
                    method: 'wallet'
                  }
                ]
              }
            },
            sequence: ['card', 'upi', 'banks', 'wallet'],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch('http://localhost:8800/api/v1/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingNumber: bookingNumber
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Payment successful - save booking
              const paymentData = {
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                amount: amount,
                currency: 'INR',
                method: 'razorpay',
                status: 'success',
                timestamp: new Date().toISOString()
              };

              await saveBookingToDatabase(paymentData);
              setLoading(false);
              onPaymentSuccess(paymentData);
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setLoading(false);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || ''
        },
        theme: {
          color: '#667eea'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          },
          confirm_close: true,
          escape: true,
          animation: true
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        timeout: 300,
        remember_customer: false,
        readonly: {
          email: false,
          contact: false,
          name: false
        }
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);

      // Add error handler for payment failures
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setLoading(false);

        // Show user-friendly error message
        const errorMsg = response.error.description || 'Payment failed. Please try again.';
        alert(`Payment Failed: ${errorMsg}`);

        // Optionally, you can retry with demo payment
        if (confirm('Would you like to try demo payment instead?')) {
          handleDemoPayment();
        }
      });

      rzp.open();

    } catch (error) {
      console.error('Payment initiation error:', error);
      setLoading(false);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const handleDemoPayment = () => {
    setLoading(true);

    const amount = getItemPrice();

    // Simulate demo booking processing (for testing)
    setTimeout(async () => {
      const demoPaymentData = {
        paymentId: 'demo_' + Date.now(),
        orderId: 'demo_order_' + Date.now(),
        signature: 'demo_signature_' + Date.now(),
        amount: amount,
        currency: 'INR',
        method: 'demo',
        status: 'success',
        timestamp: new Date().toISOString()
      };

      await saveBookingToDatabase(demoPaymentData);
      setLoading(false);
      onPaymentSuccess(demoPaymentData);
    }, 2000);
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
            <span>₹{getItemPrice().toLocaleString()}</span>
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
              <span>₹{getItemPrice().toLocaleString()}</span>
            </div>
          </div>

          {isDemoMode && (
            <div className="demo-notice">
              <h3>🔧 Demo Mode Active</h3>
              <p>Razorpay credentials not configured. Using demo payment simulation.</p>
            </div>
          )}

          <h3>Select Payment Method</h3>
          <div className="payment-options">
            <div
              className={`payment-option ${paymentMethod === 'razorpay' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('razorpay')}
            >
              <div className="payment-icon">💳</div>
              <div className="payment-info">
                <h4>Razorpay</h4>
                <p>Credit/Debit Card, UPI, Net Banking, Wallets</p>
              </div>
            </div>

            <div
              className={`payment-option ${paymentMethod === 'demo' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('demo')}
            >
              <div className="payment-icon">🎯</div>
              <div className="payment-info">
                <h4>Demo Payment</h4>
                <p>For testing purposes only</p>
              </div>
            </div>
          </div>

          <button
            className="pay-now-btn"
            onClick={() => {
              if (paymentMethod === 'razorpay') handleRazorpayPayment();
              else handleDemoPayment();
            }}
            disabled={loading}
          >
            {loading ? 'Processing Payment...' : `Pay ₹${getItemPrice().toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
