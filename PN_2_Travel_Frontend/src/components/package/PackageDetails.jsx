import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { packageService } from '../../services/api.service';
import './PackageDetails.css';

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [packageData, setPackageData] = useState(null);
  const [packageDetails, setPackageDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPackageData();
  }, [id]);

  const loadPackageData = async () => {
    try {
      setLoading(true);
      
      // First try to get package from localStorage (from search results)
      const searchResults = localStorage.getItem('searchResults');
      if (searchResults) {
        const results = JSON.parse(searchResults);
        const foundPackage = results.find(pkg => pkg._id === id);
        if (foundPackage) {
          setPackageData(foundPackage);
        }
      }

      // Get detailed package information from API
      try {
        const details = await packageService.getDetails(id);
        setPackageDetails(details);
      } catch (detailError) {
        console.log('Package details not available:', detailError);
        // Continue without detailed info
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading package:', err);
      setError('Failed to load package details');
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Store booking data
    const bookingData = {
      type: 'package',
      item: packageData,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    navigate(`/booking/package/${packageData._id}`);
  };

  const handleDynamicBooking = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    navigate(`/package-booking/${packageData._id}`);
  };

  if (loading) {
    return <div className="loading">Loading package details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>{error}</h2>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="no-package">
        <h2>Package not found</h2>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="package-details">
      <div className="package-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Search
        </button>
        <h1>{packageData.name}</h1>
        <div className="package-meta">
          <span className="duration">📅 {packageData.duration} days</span>
          <span className="type">🎯 {packageData.type}</span>
          <span className="rating">⭐ {packageData.rating || '4.0'}</span>
        </div>
      </div>

      <div className="package-content">
        <div className="package-main">
          {packageData.images && packageData.images.length > 0 && (
            <div className="package-images">
              <img 
                src={packageData.images[0]} 
                alt={packageData.name}
                className="main-image"
              />
            </div>
          )}

          <div className="package-info">
            <div className="info-section">
              <h3>Destinations</h3>
              <p>📍 {packageData.destinations?.join(', ') || 'Multiple destinations'}</p>
            </div>

            <div className="info-section">
              <h3>Description</h3>
              <p>{packageData.description || 'Experience an amazing journey with this carefully crafted package.'}</p>
            </div>

            <div className="info-section">
              <h3>Package Highlights</h3>
              <ul className="highlights-list">
                <li>🏨 Comfortable accommodation</li>
                <li>🚗 Transportation included</li>
                <li>🍽️ Meals as per itinerary</li>
                <li>🎯 Guided tours and activities</li>
                <li>📞 24/7 customer support</li>
              </ul>
            </div>

            {packageDetails && (
              <>
                {packageDetails.inclusions && (
                  <div className="info-section">
                    <h3>Inclusions</h3>
                    <ul className="inclusions-list">
                      {packageDetails.inclusions.map((item, index) => (
                        <li key={index}>✅ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {packageDetails.exclusions && (
                  <div className="info-section">
                    <h3>Exclusions</h3>
                    <ul className="exclusions-list">
                      {packageDetails.exclusions.map((item, index) => (
                        <li key={index}>❌ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {packageDetails.cancellationPolicy && (
                  <div className="info-section">
                    <h3>Cancellation Policy</h3>
                    <div className="policy-details">
                      <p><strong>Free Cancellation:</strong> {packageDetails.cancellationPolicy.freeCancellation}</p>
                      <p><strong>Partial Refund:</strong> {packageDetails.cancellationPolicy.partialRefund}</p>
                      <p><strong>No Refund:</strong> {packageDetails.cancellationPolicy.noRefund}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="package-sidebar">
          <div className="pricing-card">
            <h3>Package Pricing</h3>
            <div className="price-info">
              <span className="price">₹{packageData.basePrice || packageData.price}</span>
              <span className="price-unit">per person</span>
            </div>
            <p className="price-note">*Starting price, may vary based on preferences</p>
            
            <div className="booking-actions">
              <button 
                className="book-now-btn primary"
                onClick={handleDynamicBooking}
              >
                Customize & Book
              </button>
              <button 
                className="book-now-btn secondary"
                onClick={handleBookNow}
              >
                Quick Book
              </button>
            </div>
          </div>

          <div className="package-features">
            <h4>Package Features</h4>
            <div className="features-list">
              <div className="feature">
                <span className="feature-icon">🕐</span>
                <span>{packageData.duration} Days Duration</span>
              </div>
              <div className="feature">
                <span className="feature-icon">👥</span>
                <span>Group & Solo Friendly</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🎒</span>
                <span>All Inclusive</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📱</span>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;
