import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HotelOwnerRegistration.css';

const HotelOwnerRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Owner Information
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerAddress: '',
    
    // Hotel Information
    hotelName: '',
    hotelType: '',
    hotelAddress: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    description: '',
    
    // Business Information
    businessLicense: '',
    gstNumber: '',
    panNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    
    // Hotel Features
    totalRooms: '',
    amenities: [],
    checkInTime: '',
    checkOutTime: '',
    cancellationPolicy: '',
    
    // Agreement
    termsAccepted: false,
    marketingConsent: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amenitiesList = [
    'WiFi', 'Parking', 'Restaurant', 'Room Service', 'Gym', 'Swimming Pool',
    'Spa', 'Conference Room', 'Laundry', 'Airport Shuttle', 'Pet Friendly',
    'Air Conditioning', 'Elevator', '24/7 Front Desk'
  ];

  const hotelTypes = [
    'Budget Hotel', 'Business Hotel', 'Luxury Hotel', 'Resort', 
    'Boutique Hotel', 'Motel', 'Guest House', 'Hostel'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
        if (!formData.ownerEmail.trim()) newErrors.ownerEmail = 'Email is required';
        if (!formData.ownerPhone.trim()) newErrors.ownerPhone = 'Phone number is required';
        break;
      case 2:
        if (!formData.hotelName.trim()) newErrors.hotelName = 'Hotel name is required';
        if (!formData.hotelType) newErrors.hotelType = 'Hotel type is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        break;
      case 3:
        if (!formData.businessLicense.trim()) newErrors.businessLicense = 'Business license is required';
        if (!formData.gstNumber.trim()) newErrors.gstNumber = 'GST number is required';
        break;
      case 4:
        if (!formData.totalRooms) newErrors.totalRooms = 'Total rooms is required';
        if (!formData.checkInTime) newErrors.checkInTime = 'Check-in time is required';
        if (!formData.checkOutTime) newErrors.checkOutTime = 'Check-out time is required';
        break;
      case 5:
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    try {
      // Send data to backend API
      console.log('Submitting Hotel Owner Registration Data:', formData);

      const response = await fetch('http://localhost:8800/api/v1/hotel-owner-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        alert(`Registration submitted successfully!

Hotel: ${result.data.hotelName}
Owner: ${result.data.ownerName}
Submission Time: ${new Date(result.data.submissionTime).toLocaleString()}

We will review your application and contact you within 2-3 business days.

${result.data.emailSent ? 'Confirmation emails have been sent.' : 'Note: Email notification failed but your registration was received.'}`);

        // Reset form
        setFormData({
          ownerName: '', ownerEmail: '', ownerPhone: '', ownerAddress: '',
          hotelName: '', hotelType: '', hotelAddress: '', city: '', state: '', country: '', pincode: '', description: '',
          businessLicense: '', gstNumber: '', panNumber: '', bankAccountNumber: '', ifscCode: '',
          totalRooms: '', amenities: [], checkInTime: '', checkOutTime: '', cancellationPolicy: '',
          termsAccepted: false, marketingConsent: false
        });
        setCurrentStep(1);
      } else {
        throw new Error(result.message || 'Registration failed');
      }

    } catch (error) {
      console.error('Registration error:', error);
      alert(`Registration failed: ${error.message}. Please try again or contact support.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3>Owner Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className={errors.ownerName ? 'error' : ''}
                />
                {errors.ownerName && <span className="error-text">{errors.ownerName}</span>}
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleInputChange}
                  className={errors.ownerEmail ? 'error' : ''}
                />
                {errors.ownerEmail && <span className="error-text">{errors.ownerEmail}</span>}
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleInputChange}
                  className={errors.ownerPhone ? 'error' : ''}
                />
                {errors.ownerPhone && <span className="error-text">{errors.ownerPhone}</span>}
              </div>
              <div className="form-group full-width">
                <label>Address</label>
                <textarea
                  name="ownerAddress"
                  value={formData.ownerAddress}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="step-content">
            <h3>Hotel Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Hotel Name *</label>
                <input
                  type="text"
                  name="hotelName"
                  value={formData.hotelName}
                  onChange={handleInputChange}
                  className={errors.hotelName ? 'error' : ''}
                />
                {errors.hotelName && <span className="error-text">{errors.hotelName}</span>}
              </div>
              <div className="form-group">
                <label>Hotel Type *</label>
                <select
                  name="hotelType"
                  value={formData.hotelType}
                  onChange={handleInputChange}
                  className={errors.hotelType ? 'error' : ''}
                >
                  <option value="">Select Type</option>
                  {hotelTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.hotelType && <span className="error-text">{errors.hotelType}</span>}
              </div>
              <div className="form-group full-width">
                <label>Hotel Address</label>
                <textarea
                  name="hotelAddress"
                  value={formData.hotelAddress}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error-text">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group full-width">
                <label>Hotel Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe your hotel, its unique features, and what makes it special..."
                />
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="step-content">
            <h3>Business Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Business License Number *</label>
                <input
                  type="text"
                  name="businessLicense"
                  value={formData.businessLicense}
                  onChange={handleInputChange}
                  className={errors.businessLicense ? 'error' : ''}
                />
                {errors.businessLicense && <span className="error-text">{errors.businessLicense}</span>}
              </div>
              <div className="form-group">
                <label>GST Number *</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                  className={errors.gstNumber ? 'error' : ''}
                />
                {errors.gstNumber && <span className="error-text">{errors.gstNumber}</span>}
              </div>
              <div className="form-group">
                <label>PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Bank Account Number</label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h3>Hotel Features & Policies</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Total Rooms *</label>
                <input
                  type="number"
                  name="totalRooms"
                  value={formData.totalRooms}
                  onChange={handleInputChange}
                  className={errors.totalRooms ? 'error' : ''}
                  min="1"
                />
                {errors.totalRooms && <span className="error-text">{errors.totalRooms}</span>}
              </div>
              <div className="form-group">
                <label>Check-in Time *</label>
                <input
                  type="time"
                  name="checkInTime"
                  value={formData.checkInTime}
                  onChange={handleInputChange}
                  className={errors.checkInTime ? 'error' : ''}
                />
                {errors.checkInTime && <span className="error-text">{errors.checkInTime}</span>}
              </div>
              <div className="form-group">
                <label>Check-out Time *</label>
                <input
                  type="time"
                  name="checkOutTime"
                  value={formData.checkOutTime}
                  onChange={handleInputChange}
                  className={errors.checkOutTime ? 'error' : ''}
                />
                {errors.checkOutTime && <span className="error-text">{errors.checkOutTime}</span>}
              </div>
              <div className="form-group full-width">
                <label>Amenities</label>
                <div className="amenities-grid">
                  {amenitiesList.map(amenity => (
                    <label key={amenity} className="amenity-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group full-width">
                <label>Cancellation Policy</label>
                <textarea
                  name="cancellationPolicy"
                  value={formData.cancellationPolicy}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe your cancellation policy..."
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h3>Review & Submit</h3>
            <div className="review-section">
              <div className="review-card">
                <h4>Owner Information</h4>
                <p><strong>Name:</strong> {formData.ownerName}</p>
                <p><strong>Email:</strong> {formData.ownerEmail}</p>
                <p><strong>Phone:</strong> {formData.ownerPhone}</p>
              </div>
              <div className="review-card">
                <h4>Hotel Information</h4>
                <p><strong>Hotel Name:</strong> {formData.hotelName}</p>
                <p><strong>Type:</strong> {formData.hotelType}</p>
                <p><strong>Location:</strong> {formData.city}, {formData.state}</p>
                <p><strong>Total Rooms:</strong> {formData.totalRooms}</p>
              </div>
              <div className="review-card">
                <h4>Business Details</h4>
                <p><strong>Business License:</strong> {formData.businessLicense}</p>
                <p><strong>GST Number:</strong> {formData.gstNumber}</p>
              </div>
            </div>
            <div className="terms-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  className={errors.termsAccepted ? 'error' : ''}
                />
                <span>I accept the <a href="/terms" target="_blank">Terms and Conditions</a> *</span>
              </label>
              {errors.termsAccepted && <span className="error-text">{errors.termsAccepted}</span>}

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="marketingConsent"
                  checked={formData.marketingConsent}
                  onChange={handleInputChange}
                />
                <span>I agree to receive marketing communications</span>
              </label>
            </div>
          </div>
        );

      default:
        return <div>Step content not implemented yet</div>;
    }
  };

  return (
    <div className="hotel-owner-registration">
      <div className="registration-header">
        <h1>🏨 Hotel Owner Registration</h1>
        <p>Join our network of 1,200+ partner hotels and grow your business</p>
      </div>

      <div className="registration-container">
        {/* Progress Bar */}
        <div className="progress-bar">
          {[1, 2, 3, 4, 5].map(step => (
            <div
              key={step}
              className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
            >
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 && 'Owner Info'}
                {step === 2 && 'Hotel Details'}
                {step === 3 && 'Business Info'}
                {step === 4 && 'Features'}
                {step === 5 && 'Review'}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          {renderStepContent()}

          <div className="form-navigation">
            {currentStep > 1 && (
              <button type="button" onClick={prevStep} className="btn-secondary">
                Previous
              </button>
            )}
            {currentStep < 5 ? (
              <button type="button" onClick={nextStep} className="btn-primary">
                Next
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="btn-submit">
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            )}
          </div>
        </form>

        <div className="registration-footer">
          <div className="footer-actions">
            <Link to="/" className="homepage-btn">
              🏠 Go to Homepage
            </Link>
            <Link to="/hotel-owner-dashboard" className="login-btn">
              🔑 Hotel Owner Login
            </Link>
          </div>
          <div className="footer-info">
            <p>Already have a hotel registered? Use the login button above to access your booking dashboard.</p>
            <p>Need help? Contact us at <a href="mailto:projecttravelbooking@gmail.com">projecttravelbooking@gmail.com</a></p>
            <p><Link to="/" className="back-link">← Back to Home</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelOwnerRegistration;
