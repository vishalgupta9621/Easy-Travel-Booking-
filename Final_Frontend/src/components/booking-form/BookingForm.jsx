import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import PaymentGateway from '../payment/PaymentGateway';
import './BookingForm.css';

const BookingForm = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { travelData, searchParams, travelType, serviceData } = location.state || {};

  // Handle both old and new data structures
  const bookingData = serviceData || travelData;
  const bookingType = travelType || searchParams?.travelType || 'hotel';
  const searchInfo = searchParams || (serviceData?.searchData);

  const [passengers, setPassengers] = useState([
    {
      title: 'Mr',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      age: '',
      gender: 'male',
      seatPreference: 'window'
    }
  ]);

  const [contactInfo, setContactInfo] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    emergencyContact: {
      name: '',
      phone: ''
    }
  });

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [finalBookingData, setFinalBookingData] = useState(null);

  // Add more passengers based on search params
  const addPassenger = () => {
    if (passengers.length < 9) {
      setPassengers([...passengers, {
        title: 'Mr',
        firstName: '',
        lastName: '',
        age: '',
        gender: 'male',
        seatPreference: 'window'
      }]);
    }
  };

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const updatePassenger = (index, field, value) => {
    const updated = passengers.map((passenger, i) => 
      i === index ? { ...passenger, [field]: value } : passenger
    );
    setPassengers(updated);
  };

  const updateContactInfo = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setContactInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setContactInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const calculateTotalPrice = () => {
    if (bookingType === 'hotel' && bookingData?.totalPrice) {
      // For hotel bookings, use the pre-calculated total price
      const basePrice = bookingData.totalPrice;
      const taxes = Math.round(basePrice * 0.12); // 12% tax
      const serviceFee = 50;
      const total = basePrice + taxes + serviceFee;

      return {
        basePrice,
        taxes,
        serviceFee,
        total
      };
    } else {
      // For other travel types
      const basePrice = bookingData?.pricePerPerson || bookingData?.basePrice || 0;
      const taxes = bookingData?.taxes || 0;
      const serviceFee = 50; // Fixed service fee
      const totalBase = basePrice * passengers.length;
      const totalTaxes = taxes * passengers.length;

      return {
        basePrice: totalBase,
        taxes: totalTaxes,
        serviceFee,
        total: totalBase + totalTaxes + serviceFee
      };
    }
  };

  const validateForm = () => {
    // Validate passengers
    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];
      if (!passenger.firstName || !passenger.lastName || !passenger.age) {
        setError(`Please fill all details for passenger ${i + 1}`);
        return false;
      }
      if (passenger.age < 0 || passenger.age > 120) {
        setError(`Please enter a valid age for passenger ${i + 1}`);
        return false;
      }
    }

    // Validate contact info
    if (!contactInfo.email || !contactInfo.phone) {
      setError('Please provide contact email and phone number');
      return false;
    }

    return true;
  };

  const handleBooking = async () => {
    if (!validateForm()) return;

    // Prepare booking data based on travel type
    let newBookingData;

    if (bookingType === 'hotel') {
      newBookingData = {
        travelType: 'hotel',
        serviceId: bookingData.hotel._id,
        hotelBooking: {
          hotelId: bookingData.hotel._id,
          roomId: bookingData.room._id,
          checkIn: searchInfo.checkIn,
          checkOut: searchInfo.checkOut,
          numberOfNights: bookingData.numberOfNights,
          roomType: bookingData.room.title,
          totalPrice: bookingData.totalPrice
        },
        passengers: passengers.map(p => ({
          ...p,
          identityProof: {
            type: 'aadhar',
            number: '1234-5678-9012' // Mock data
          }
        })),
        contact: contactInfo,
        payment: {
          method: paymentMethod,
          amount: bookingData.totalPrice
        }
      };
    } else {
      // For flights, trains, buses
      newBookingData = {
        travelType: bookingType,
        serviceId: bookingData._id,
        journey: {
          origin: searchInfo.origin,
          destination: searchInfo.destination,
          departureDate: searchInfo.departureDate,
          arrivalDate: searchInfo.departureDate,
          departureTime: bookingData.schedule?.departureTime,
          arrivalTime: bookingData.schedule?.arrivalTime
        },
        passengers: passengers.map(p => ({
          ...p,
          identityProof: {
            type: 'aadhar',
            number: '1234-5678-9012' // Mock data
          }
        })),
        bookingDetails: {
          ...(bookingType === 'flight' && { class: searchInfo.class }),
          ...(bookingType === 'train' && { trainClass: searchInfo.class }),
          ...(bookingType === 'bus' && { busType: bookingData.busType }),
          totalSeats: passengers.length
        },
        contact: contactInfo,
        payment: {
          method: paymentMethod
        },
        addOns: []
      };
    }

    setFinalBookingData(newBookingData);
    setShowPaymentGateway(true);
  };

    const handlePaymentSuccess = async (paymentResult) => {
      setLoading(true);
      setError(null);

      try {
        // Add payment details to booking data
        const completeBookingData = {
          ...finalBookingData,
          payment: {
            ...finalBookingData.payment,
            transactionId: paymentResult.transactionId
          }
        };

        const response = await axios.post('/api/travel-bookings', completeBookingData);

        // Navigate to booking confirmation
        navigate('/booking-confirmation', {
          state: {
            booking: response.data.booking,
            pointsEarned: response.data.pointsEarned
          }
        });

      } catch (err) {
        setError(err.response?.data?.message || 'Booking failed. Please try again.');
        console.error('Booking error:', err);
        setShowPaymentGateway(false);
      } finally {
        setLoading(false);
      }
    };

    const handlePaymentFailure = (error) => {
      setError(`Payment failed: ${error.error}`);
      setShowPaymentGateway(false);
    };

    const handlePaymentCancel = () => {
      setShowPaymentGateway(false);
    };

  if (!bookingData) {
    return (
      <div className="booking-form-container">
        <div className="error-state">
          <h2>Invalid Booking Request</h2>
          <p>Please start your booking from the search results.</p>
          <button onClick={() => navigate('/travel')} className="btn-primary">
            Search Travel Options
          </button>
        </div>
      </div>
    );
  }

  const pricing = calculateTotalPrice();

  // Show payment gateway if payment is in progress
  if (showPaymentGateway) {
    return (
      <div className="booking-form-container">
        <PaymentGateway
          amount={pricing.total}
          paymentMethod={paymentMethod}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onCancel={handlePaymentCancel}
        />
      </div>
    );
  }

  return (
    <div className="booking-form-container">
      <div className="booking-header">
        <h1>Complete Your Booking</h1>
        <div className="journey-summary">
          {bookingType === 'hotel' ? (
            <>
              <span>{bookingData.hotel?.name}</span>
              <span>{searchInfo?.checkIn} to {searchInfo?.checkOut}</span>
              <span>{bookingData.room?.title} • {passengers.length} guest{passengers.length > 1 ? 's' : ''}</span>
            </>
          ) : (
            <>
              <span>{searchInfo?.originDisplay} → {searchInfo?.destinationDisplay}</span>
              <span>{searchInfo?.departureDate}</span>
              <span>{passengers.length} passenger{passengers.length > 1 ? 's' : ''}</span>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="booking-content">
        <div className="booking-form">
          {/* Passenger Details */}
          <div className="form-section">
            <h2>Passenger Details</h2>
            {passengers.map((passenger, index) => (
              <div key={index} className="passenger-form">
                <div className="passenger-header">
                  <h3>Passenger {index + 1}</h3>
                  {passengers.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removePassenger(index)}
                      className="remove-passenger"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="form-row">
                  <select
                    value={passenger.title}
                    onChange={(e) => updatePassenger(index, 'title', e.target.value)}
                  >
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Dr">Dr</option>
                  </select>
                  
                  <input
                    type="text"
                    placeholder="First Name"
                    value={passenger.firstName}
                    onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                    required
                  />
                  
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={passenger.lastName}
                    onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <input
                    type="number"
                    placeholder="Age"
                    value={passenger.age}
                    onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                    min="0"
                    max="120"
                    required
                  />
                  
                  <select
                    value={passenger.gender}
                    onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  
                  <select
                    value={passenger.seatPreference}
                    onChange={(e) => updatePassenger(index, 'seatPreference', e.target.value)}
                  >
                    <option value="window">Window</option>
                    <option value="aisle">Aisle</option>
                    <option value="middle">Middle</option>
                  </select>
                </div>
              </div>
            ))}
            
            {passengers.length < 9 && (
              <button type="button" onClick={addPassenger} className="add-passenger">
                + Add Passenger
              </button>
            )}
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h2>Contact Information</h2>
            <div className="form-row">
              <input
                type="email"
                placeholder="Email Address"
                value={contactInfo.email}
                onChange={(e) => updateContactInfo('email', e.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={contactInfo.phone}
                onChange={(e) => updateContactInfo('phone', e.target.value)}
                required
              />
            </div>
            
            <div className="form-row">
              <input
                type="text"
                placeholder="Emergency Contact Name"
                value={contactInfo.emergencyContact.name}
                onChange={(e) => updateContactInfo('emergencyContact.name', e.target.value)}
              />
              <input
                type="tel"
                placeholder="Emergency Contact Phone"
                value={contactInfo.emergencyContact.phone}
                onChange={(e) => updateContactInfo('emergencyContact.phone', e.target.value)}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="form-section">
            <h2>Payment Method</h2>
            <div className="payment-methods">
              {[
                { value: 'credit_card', label: 'Credit Card', icon: '💳' },
                { value: 'debit_card', label: 'Debit Card', icon: '💳' },
                { value: 'upi', label: 'UPI', icon: '📱' },
                { value: 'net_banking', label: 'Net Banking', icon: '🏦' },
                { value: 'wallet', label: 'Wallet', icon: '👛' }
              ].map(method => (
                <label key={method.value} className="payment-method">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="payment-icon">{method.icon}</span>
                  <span>{method.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="booking-summary">
          <h2>Booking Summary</h2>
          
          <div className="travel-details">
            <h3>{travelData.airline?.name || travelData.trainName || travelData.operator?.name}</h3>
            <p>{travelData.flightNumber || travelData.trainNumber || travelData.busNumber}</p>
            
            <div className="journey-info">
              <div className="time-info">
                <span>{travelData.schedule.departureTime}</span>
                <span>→</span>
                <span>{travelData.schedule.arrivalTime}</span>
              </div>
              <div className="duration">
                {typeof travelData.schedule.duration === 'number' 
                  ? `${Math.floor(travelData.schedule.duration / 60)}h ${travelData.schedule.duration % 60}m`
                  : travelData.schedule.duration
                }
              </div>
            </div>
          </div>

          <div className="price-breakdown">
            <div className="price-item">
              <span>Base Price ({passengers.length} passenger{passengers.length > 1 ? 's' : ''})</span>
              <span>₹{pricing.basePrice.toLocaleString()}</span>
            </div>
            {pricing.taxes > 0 && (
              <div className="price-item">
                <span>Taxes & Fees</span>
                <span>₹{pricing.taxes.toLocaleString()}</span>
              </div>
            )}
            <div className="price-item">
              <span>Service Fee</span>
              <span>₹{pricing.serviceFee}</span>
            </div>
            <div className="price-total">
              <span>Total Amount</span>
              <span>₹{pricing.total.toLocaleString()}</span>
            </div>
          </div>

          <button
            className="book-now-btn"
            onClick={handleBooking}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Pay ₹${pricing.total.toLocaleString()}`}
          </button>

          <div className="security-info">
            <p>🔒 Your payment is secured with 256-bit SSL encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
