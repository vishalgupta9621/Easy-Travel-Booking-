import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { packageService } from '../../services/api.service';
import './DynamicPackageBooking.css';

const DynamicPackageBooking = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  
  const [packageData, setPackageData] = useState(null);
  const [packageOptions, setPackageOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [travelDetails, setTravelDetails] = useState({
    startDate: '',
    endDate: '',
    numberOfTravelers: 1,
    travelers: [{ name: '', age: '', gender: 'male' }]
  });
  
  const [selectedPreferences, setSelectedPreferences] = useState({
    hotelCategory: 'standard',
    transportType: 'flight',
    transportClass: 'economy',
    addOns: []
  });
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    }
  });
  
  const [pricingBreakdown, setPricingBreakdown] = useState(null);
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: '',
    relation: ''
  });

  useEffect(() => {
    loadPackageData();
  }, [packageId]);

  const loadPackageData = async () => {
    try {
      setLoading(true);
      const [packageResponse, optionsResponse] = await Promise.all([
        packageService.getDetails(packageId),
        packageService.getPackageOptions(packageId)
      ]);
      
      setPackageData(packageResponse);
      setPackageOptions(optionsResponse.data);
      
      // Set default end date (package duration)
      if (packageResponse.duration) {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + packageResponse.duration);
        
        setTravelDetails(prev => ({
          ...prev,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }));
      }
      
    } catch (error) {
      console.error('Error loading package data:', error);
      setError('Failed to load package information');
    } finally {
      setLoading(false);
    }
  };

  const handleTravelerChange = (index, field, value) => {
    const updatedTravelers = [...travelDetails.travelers];
    updatedTravelers[index] = { ...updatedTravelers[index], [field]: value };
    setTravelDetails(prev => ({ ...prev, travelers: updatedTravelers }));
  };

  const addTraveler = () => {
    setTravelDetails(prev => ({
      ...prev,
      numberOfTravelers: prev.numberOfTravelers + 1,
      travelers: [...prev.travelers, { name: '', age: '', gender: 'male' }]
    }));
  };

  const removeTraveler = (index) => {
    if (travelDetails.numberOfTravelers > 1) {
      const updatedTravelers = travelDetails.travelers.filter((_, i) => i !== index);
      setTravelDetails(prev => ({
        ...prev,
        numberOfTravelers: prev.numberOfTravelers - 1,
        travelers: updatedTravelers
      }));
    }
  };

  const calculatePrice = async () => {
    try {
      setCalculating(true);
      const response = await packageService.calculateDynamicPrice(
        packageId,
        selectedPreferences,
        travelDetails
      );
      setPricingBreakdown(response.data);
    } catch (error) {
      console.error('Error calculating price:', error);
      setError('Failed to calculate pricing');
    } finally {
      setCalculating(false);
    }
  };

  const handleBooking = async () => {
    try {
      if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
        alert('Please fill in all customer information');
        return;
      }

      // Get user data from localStorage (this is how it's stored in AuthContext)
      const user = JSON.parse(localStorage.getItem('user')) || {};

      const bookingData = {
        packageId,
        userId: user._id || user.id, // Add userId to associate booking with user
        customerInfo: {
          ...customerInfo,
          name: user.name || customerInfo.name,
          email: user.email || customerInfo.email,
          phone: user.phone || customerInfo.phone
        },
        travelDetails,
        selectedPreferences,
        emergencyContact,
        paymentInfo: {
          method: 'pending',
          status: 'pending'
        }
      };

      const response = await packageService.createPackageBooking(bookingData);
      
      if (response.success) {
        alert(`Booking created successfully! Booking Number: ${response.data.bookingNumber}`);
        navigate('/booking-confirmation', { 
          state: { 
            bookingData: response.data,
            packageData 
          }
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  if (loading) return <div className="loading">Loading package details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!packageData) return <div className="error">Package not found</div>;

  return (
    <div className="dynamic-package-booking">
      <div className="package-header">
        <h1>{packageData.name}</h1>
        <p>{packageData.description}</p>
        <div className="package-info">
          <span>Duration: {packageData.duration} days</span>
          <span>Destinations: {packageData.destinations?.join(', ')}</span>
          <span>Type: {packageData.type}</span>
        </div>
      </div>

      <div className="booking-form">
        {/* Travel Details Section */}
        <section className="form-section">
          <h3>Travel Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={travelDetails.startDate}
                onChange={(e) => setTravelDetails(prev => ({ ...prev, startDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={travelDetails.endDate}
                onChange={(e) => setTravelDetails(prev => ({ ...prev, endDate: e.target.value }))}
                min={travelDetails.startDate}
              />
            </div>
          </div>
        </section>

        {/* Travelers Section */}
        <section className="form-section">
          <h3>Travelers ({travelDetails.numberOfTravelers})</h3>
          {travelDetails.travelers.map((traveler, index) => (
            <div key={index} className="traveler-form">
              <h4>Traveler {index + 1}</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={traveler.name}
                    onChange={(e) => handleTravelerChange(index, 'name', e.target.value)}
                    placeholder="Full Name"
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={traveler.age}
                    onChange={(e) => handleTravelerChange(index, 'age', e.target.value)}
                    min="1"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={traveler.gender}
                    onChange={(e) => handleTravelerChange(index, 'gender', e.target.value)}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {index > 0 && (
                  <button 
                    type="button" 
                    onClick={() => removeTraveler(index)}
                    className="remove-traveler"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={addTraveler} className="add-traveler">
            Add Traveler
          </button>
        </section>

        {/* Preferences Section */}
        <section className="form-section">
          <h3>Package Preferences</h3>
          
          {/* Hotel Category */}
          <div className="form-group">
            <label>Hotel Category</label>
            <div className="preference-options">
              {packageOptions?.hotelOptions?.map((option) => (
                <label key={option.category} className="radio-option">
                  <input
                    type="radio"
                    name="hotelCategory"
                    value={option.category}
                    checked={selectedPreferences.hotelCategory === option.category}
                    onChange={(e) => setSelectedPreferences(prev => ({ 
                      ...prev, 
                      hotelCategory: e.target.value 
                    }))}
                  />
                  <div className="option-details">
                    <span className="option-name">{option.category}</span>
                    <span className="option-price">₹{option.pricePerNight}/night</span>
                    <span className="option-desc">{option.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Transport Type */}
          <div className="form-group">
            <label>Transport Type</label>
            <div className="preference-options">
              {packageOptions?.transportOptions?.map((option) => (
                <label key={`${option.type}-${option.class}`} className="radio-option">
                  <input
                    type="radio"
                    name="transportType"
                    value={option.type}
                    checked={selectedPreferences.transportType === option.type}
                    onChange={(e) => {
                      setSelectedPreferences(prev => ({ 
                        ...prev, 
                        transportType: e.target.value,
                        transportClass: option.class
                      }));
                    }}
                  />
                  <div className="option-details">
                    <span className="option-name">{option.type} - {option.class}</span>
                    <span className="option-price">₹{option.basePrice}</span>
                    <span className="option-desc">{option.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Calculate Price Button */}
        <div className="calculate-section">
          <button 
            onClick={calculatePrice} 
            disabled={calculating}
            className="calculate-btn"
          >
            {calculating ? 'Calculating...' : 'Calculate Price'}
          </button>
        </div>

        {/* Pricing Breakdown */}
        {pricingBreakdown && (
          <section className="pricing-section">
            <h3>Pricing Breakdown</h3>
            <div className="pricing-details">
              <div className="price-row">
                <span>Base Package Price:</span>
                <span>₹{pricingBreakdown.basePackagePrice}</span>
              </div>
              <div className="price-row">
                <span>Hotel ({selectedPreferences.hotelCategory}):</span>
                <span>₹{pricingBreakdown.hotelPrice}</span>
              </div>
              <div className="price-row">
                <span>Transport ({selectedPreferences.transportType}):</span>
                <span>₹{pricingBreakdown.transportPrice}</span>
              </div>
              {pricingBreakdown.addOnsPrice > 0 && (
                <div className="price-row">
                  <span>Add-ons:</span>
                  <span>₹{pricingBreakdown.addOnsPrice}</span>
                </div>
              )}
              <div className="price-row">
                <span>Taxes & Fees:</span>
                <span>₹{pricingBreakdown.taxes + pricingBreakdown.serviceFee}</span>
              </div>
              {pricingBreakdown.discount > 0 && (
                <div className="price-row discount">
                  <span>Discount:</span>
                  <span>-₹{pricingBreakdown.discount}</span>
                </div>
              )}
              <div className="price-row total">
                <span>Total Amount:</span>
                <span>₹{pricingBreakdown.totalAmount}</span>
              </div>
            </div>
          </section>
        )}

        {/* Customer Information Section */}
        {pricingBreakdown && (
          <section className="form-section customer-section">
            <h3>Customer Information</h3>
            <div className="customer-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={customerInfo.address.city}
                  onChange={(e) => setCustomerInfo(prev => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value }
                  }))}
                  placeholder="Enter city"
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={customerInfo.address.state}
                  onChange={(e) => setCustomerInfo(prev => ({
                    ...prev,
                    address: { ...prev.address, state: e.target.value }
                  }))}
                  placeholder="Enter state"
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={customerInfo.address.country}
                  onChange={(e) => setCustomerInfo(prev => ({
                    ...prev,
                    address: { ...prev.address, country: e.target.value }
                  }))}
                  placeholder="Enter country"
                />
              </div>
            </div>
          </section>
        )}

        {/* Emergency Contact Section */}
        {pricingBreakdown && (
          <section className="form-section">
            <h3>Emergency Contact</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Contact Name</label>
                <input
                  type="text"
                  value={emergencyContact.name}
                  onChange={(e) => setEmergencyContact(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Emergency contact name"
                />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  value={emergencyContact.phone}
                  onChange={(e) => setEmergencyContact(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Emergency contact phone"
                />
              </div>
              <div className="form-group">
                <label>Relation</label>
                <input
                  type="text"
                  value={emergencyContact.relation}
                  onChange={(e) => setEmergencyContact(prev => ({ ...prev, relation: e.target.value }))}
                  placeholder="Relationship (e.g., spouse, parent)"
                />
              </div>
            </div>
          </section>
        )}

        {/* Book Now Section */}
        {pricingBreakdown && (
          <section className="form-section">
            <div className="booking-summary">
              <h3>Booking Summary</h3>
              <div className="summary-details">
                <p><strong>Package:</strong> {packageData.name}</p>
                <p><strong>Travel Dates:</strong> {travelDetails.startDate} to {travelDetails.endDate}</p>
                <p><strong>Travelers:</strong> {travelDetails.numberOfTravelers}</p>
                <p><strong>Hotel:</strong> {selectedPreferences.hotelCategory}</p>
                <p><strong>Transport:</strong> {selectedPreferences.transportType} - {selectedPreferences.transportClass}</p>
                <p className="total-amount"><strong>Total Amount: ₹{pricingBreakdown.totalAmount}</strong></p>
              </div>
              <button onClick={handleBooking} className="book-btn">
                Book Now
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default DynamicPackageBooking;
