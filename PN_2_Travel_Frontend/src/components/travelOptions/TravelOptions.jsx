import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hotelService, flightService, trainService, busService, packageService } from '../../services/api.service';
import DestinationDropdown from '../common/DestinationDropdown';
import './travelOptions.css';

// Search Results Component (moved outside to fix hook usage)
const SearchResults = ({ results, type, searchData }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (!results || results.length === 0) {
    return (
      <div className="no-results">
        <p>No {type} found matching your criteria.</p>
      </div>
    );
  }

  const handleViewHotel = (hotel) => {
    // Store hotel data for viewing
    localStorage.setItem('viewingHotel', JSON.stringify(hotel));
    // Navigate to hotel details page
    navigate(`/hotel/${hotel._id}`);
  };

  const handleBooking = (bookingType, item) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login page
      navigate('/login');
      return;
    }

    // Store booking data in localStorage with search parameters
    const bookingData = {
      type: bookingType,
      item: item,
      timestamp: new Date().toISOString(),
      // Include search parameters for proper calculation
      ...(searchData && {
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        guests: searchData.guests,
        rooms: searchData.rooms,
        destination: searchData.destination
      })
    };

    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));

    // Navigate to booking details page
    navigate(`/booking/${bookingType}/${item._id || 'demo'}`);
  };

  return (
    <div className="search-results">
      <div className="results-header">
        <h2>Search Results</h2>
        <p>{results.length} {type} found</p>
      </div>
      <div className="results-grid">
        {results.map((item, index) => (
          <div key={item._id || index} className="result-card">
            {type === 'hotels' && (
              <>
                <div className="result-image">
                  {item.photos && item.photos.length > 0 ? (
                    <img
                      src={item.photos[0]?.url || item.photos[0]}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';
                      }}
                    />
                  ) : (
                    <div className="placeholder-image">
                      🏨
                    </div>
                  )}
                </div>
                <div className="result-content">
                  <h3>{item.name}</h3>
                  <div className="location">
                    📍 {item.city}
                  </div>
                  <div className="description">
                    {item.desc || 'A comfortable stay with modern amenities'}
                  </div>
                  <div className="result-footer">
                    <div className="rating">
                      <span className="rating-score">{item.rating || '4.0'}</span>
                      <span>⭐</span>
                    </div>
                    <div className="price-and-book">
                      <div className="price">
                        <span className="price-amount">₹{item.cheapestPrice}</span>
                        <span className="price-unit">/night</span>
                      </div>
                    </div>
                  </div>
                  <div className="hotel-actions">
                    <button
                      className="view-btn"
                      onClick={() => handleViewHotel(item)}
                    >
                      View Details
                    </button>
                    <button
                      className="book-btn"
                      onClick={() => handleBooking('hotel', item)}
                    >
                      Book Hotel
                    </button>
                  </div>
                </div>
              </>
            )}
            
            {type === 'flights' && (
              <div className="flight-card">
                <div className="result-image">
                  <div className="placeholder-image">
                    ✈️
                  </div>
                </div>
                <div className="result-content">
                  <div className="flight-header">
                    <h3>{item.airline?.name} {item.flightNumber}</h3>
                    <span className="aircraft-model">{item.aircraft?.model || 'Boeing 737'}</span>
                  </div>
                  <div className="flight-route">
                    <span className="departure">{item.route?.origin?.city || item.route?.origin}</span>
                    <span className="route-arrow">→</span>
                    <span className="arrival">{item.route?.destination?.city || item.route?.destination}</span>
                  </div>
                  <div className="flight-timing">
                    <div>
                      <div className="time">{item.schedule?.departureTime}</div>
                      <div>Departure</div>
                    </div>
                    <div className="duration">{Math.floor(item.schedule?.duration / 60)}h {item.schedule?.duration % 60}m</div>
                    <div>
                      <div className="time">{item.schedule?.arrivalTime}</div>
                      <div>Arrival</div>
                    </div>
                  </div>
                  <div className="result-footer">
                    <div className="class-info">Economy</div>
                    <div className="price-and-book">
                      <div className="price">
                        <span className="price-amount">₹{item.pricing?.economy?.basePrice}</span>
                      </div>
                      <button
                        className="book-btn"
                        onClick={() => handleBooking('flight', item)}
                      >
                        Book Flight
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {type === 'trains' && (
              <>
                <h4>{item.trainName} ({item.trainNumber})</h4>
                <p>🚂 {item.route?.origin?.city || item.route?.origin} → {item.route?.destination?.city || item.route?.destination}</p>
                <p>🕐 {item.schedule?.departureTime} - {item.schedule?.arrivalTime}</p>
                <p>⏱️ {Math.floor(item.schedule?.duration / 60)}h {item.schedule?.duration % 60}m</p>
                <p>💰 ₹{item.pricing?.sleeper?.basePrice}</p>
                <button 
                  className="book-btn"
                  onClick={() => handleBooking('train', item)}
                >
                  Book Train
                </button>
              </>
            )}
            
            {type === 'buses' && (
              <>
                <h4>{item.operator} - {item.busNumber}</h4>
                <p>🚌 {item.route?.origin?.city || item.route?.origin} → {item.route?.destination?.city || item.route?.destination}</p>
                <p>🕐 {item.schedule?.departureTime} - {item.schedule?.arrivalTime}</p>
                <p>🚌 {item.busType}</p>
                <p>💰 ₹{item.pricing?.economy?.basePrice}</p>
                <button 
                  className="book-btn"
                  onClick={() => handleBooking('bus', item)}
                >
                  Book Bus
                </button>
              </>
            )}
            
            {type === 'packages' && (
              <>
                <h4>{item.name}</h4>
                <p>📅 {item.duration} days</p>
                <p>📍 {item.destinations?.join(', ')}</p>
                <p>🎯 {item.type}</p>
                <p>💰 Starting from ₹{item.basePrice || item.price}</p>
                <p>{item.description}</p>
                <div className="package-actions">
                  <button
                    className="view-btn"
                    onClick={() => navigate(`/package/${item._id}`)}
                  >
                    View Details
                  </button>
                  <button
                    className="book-btn"
                    onClick={() => navigate(`/package-booking/${item._id}`)}
                  >
                    Book Package
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const TravelOptions = () => {
  const [activeTab, setActiveTab] = useState('hotels');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentSearchData, setCurrentSearchData] = useState(null);

  const travelOptions = [
    { id: 'hotels', label: 'Hotels', icon: '🏨' },
    { id: 'flights', label: 'Flights', icon: '✈️' },
    { id: 'trains', label: 'Trains', icon: '🚂' },
    { id: 'buses', label: 'Buses', icon: '🚌' },
    { id: 'packages', label: 'Complete Packages', icon: '📦' }
  ];

  // Clear results when switching tabs
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchResults(null);
    setHasSearched(false);
  };

  return (
    <div className="travel-options">
      <div className="travel-tabs">
        {travelOptions.map((option) => (
          <button
            key={option.id}
            className={`travel-tab ${activeTab === option.id ? 'active' : ''}`}
            onClick={() => handleTabChange(option.id)}
          >
            <span className="tab-icon">{option.icon}</span>
            <span className="tab-label">{option.label}</span>
          </button>
        ))}
      </div>

      <div className="travel-content">
        {activeTab === 'hotels' && <HotelSearch setSearchResults={setSearchResults} setIsSearching={setIsSearching} setHasSearched={setHasSearched} setCurrentSearchData={setCurrentSearchData} />}
        {activeTab === 'flights' && <FlightSearch setSearchResults={setSearchResults} setIsSearching={setIsSearching} setHasSearched={setHasSearched} />}
        {activeTab === 'trains' && <TrainSearch setSearchResults={setSearchResults} setIsSearching={setIsSearching} setHasSearched={setHasSearched} />}
        {activeTab === 'buses' && <BusSearch setSearchResults={setSearchResults} setIsSearching={setIsSearching} setHasSearched={setHasSearched} />}
        {activeTab === 'packages' && <PackageSearch setSearchResults={setSearchResults} setIsSearching={setIsSearching} setHasSearched={setHasSearched} />}
      </div>

      {/* Search Results Section */}
      {hasSearched && (
        <div className="search-results-section" style={{ 
          display: 'block', 
          width: '100%', 
          minHeight: '200px',
          backgroundColor: '#f8f9fa',
          marginTop: '40px',
          padding: '30px',
          borderRadius: '15px'
        }}>
          {isSearching ? (
            <div className="loading-results">
              <div className="loading-spinner"></div>
              <p>Searching for the best options...</p>
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <SearchResults results={searchResults} type={activeTab} searchData={currentSearchData} />
          ) : (
            <div className="no-results">
              <p>No results found. Please try different search criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Hotel Search Component
const HotelSearch = ({ setSearchResults, setIsSearching, setHasSearched, setCurrentSearchData }) => {
  const [searchData, setSearchData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1
  });

  const handleSearch = async () => {
    if (!searchData.destination || !searchData.checkIn || !searchData.checkOut) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Hotel search data:', searchData);
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults(null);
    setCurrentSearchData(searchData); // Store search data for booking

    try {
      const searchParams = {
        city: searchData.destination,
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        guests: searchData.guests,
        rooms: searchData.rooms
      };

      const results = await hotelService.search(searchParams);
      
      console.log('Hotel search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Hotel search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="search-form hotel-search">
      <div className="search-fields">
        <div className="field-group">
          <label>Where are you going?</label>
          <input
            type="text"
            placeholder="Enter destination"
            value={searchData.destination}
            onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
            required
          />
        </div>
        
        <div className="field-group">
          <label>Check-in</label>
          <input
            type="date"
            value={searchData.checkIn}
            onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
            required
          />
        </div>
        
        <div className="field-group">
          <label>Check-out</label>
          <input
            type="date"
            value={searchData.checkOut}
            onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
            required
          />
        </div>
        
        <div className="field-group">
          <label>Guests & Rooms</label>
          <div className="guests-rooms">
            <select 
              value={searchData.guests}
              onChange={(e) => setSearchData({...searchData, guests: parseInt(e.target.value)})}
            >
              {[1,2,3,4,5,6].map(num => (
                <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
              ))}
            </select>
            <select 
              value={searchData.rooms}
              onChange={(e) => setSearchData({...searchData, rooms: parseInt(e.target.value)})}
            >
              {[1,2,3,4,5].map(num => (
                <option key={num} value={num}>{num} Room{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <button className="search-btn hotel-btn" onClick={handleSearch}>
        Search Hotels
      </button>
    </div>
  );
};

// Flight Search Component
const FlightSearch = ({ setSearchResults, setIsSearching, setHasSearched }) => {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    departure: '',
    return: '',
    passengers: 1,
    class: 'economy'
  });

  const handleSearch = async () => {
    if (!searchData.from || !searchData.to || !searchData.departure) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Flight search data:', searchData);
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults(null);

    try {
      const results = await flightService.search(
        searchData.from,
        searchData.to,
        searchData.departure,
        searchData.return || null
      );

      console.log('Flight search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Flight search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="search-form flight-search">
      <div className="search-fields">
        <div className="field-group">
          <label>From</label>
          <DestinationDropdown
            type="airport"
            value={searchData.from}
            onChange={(id) => setSearchData({...searchData, from: id})}
            placeholder="Select departure airport"
            required
          />
        </div>

        <div className="field-group">
          <label>To</label>
          <DestinationDropdown
            type="airport"
            value={searchData.to}
            onChange={(id) => setSearchData({...searchData, to: id})}
            placeholder="Select destination airport"
            required
          />
        </div>

        <div className="field-group">
          <label>Departure</label>
          <input
            type="date"
            value={searchData.departure}
            onChange={(e) => setSearchData({...searchData, departure: e.target.value})}
            required
          />
        </div>

        <div className="field-group">
          <label>Return (Optional)</label>
          <input
            type="date"
            value={searchData.return}
            onChange={(e) => setSearchData({...searchData, return: e.target.value})}
          />
        </div>

        <div className="field-group">
          <label>Class</label>
          <select
            value={searchData.class}
            onChange={(e) => setSearchData({...searchData, class: e.target.value})}
          >
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>
      </div>

      <button className="search-btn flight-btn" onClick={handleSearch}>
        Search Flights
      </button>
    </div>
  );
};

// Train Search Component
const TrainSearch = ({ setSearchResults, setIsSearching, setHasSearched }) => {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    departure: '',
    passengers: 1,
    class: 'sleeper'
  });

  const handleSearch = async () => {
    if (!searchData.from || !searchData.to || !searchData.departure) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Train search data:', searchData);
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults(null);

    try {
      const results = await trainService.search(
        searchData.from,
        searchData.to,
        searchData.departure
      );

      console.log('Train search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Train search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="search-form train-search">
      <div className="search-fields">
        <div className="field-group">
          <label>From</label>
          <DestinationDropdown
            type="railway_station"
            value={searchData.from}
            onChange={(id) => setSearchData({...searchData, from: id})}
            placeholder="Select departure station"
            required
          />
        </div>

        <div className="field-group">
          <label>To</label>
          <DestinationDropdown
            type="railway_station"
            value={searchData.to}
            onChange={(id) => setSearchData({...searchData, to: id})}
            placeholder="Select destination station"
            required
          />
        </div>

        <div className="field-group">
          <label>Departure</label>
          <input
            type="date"
            value={searchData.departure}
            onChange={(e) => setSearchData({...searchData, departure: e.target.value})}
            required
          />
        </div>

        <div className="field-group">
          <label>Class</label>
          <select
            value={searchData.class}
            onChange={(e) => setSearchData({...searchData, class: e.target.value})}
          >
            <option value="sleeper">Sleeper</option>
            <option value="ac3">AC 3 Tier</option>
            <option value="ac2">AC 2 Tier</option>
            <option value="ac1">AC 1 Tier</option>
          </select>
        </div>
      </div>

      <button className="search-btn train-btn" onClick={handleSearch}>
        Search Trains
      </button>
    </div>
  );
};

// Bus Search Component
const BusSearch = ({ setSearchResults, setIsSearching, setHasSearched }) => {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    departure: '',
    passengers: 1
  });

  const handleSearch = async () => {
    if (!searchData.from || !searchData.to || !searchData.departure) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Bus search data:', searchData);
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults(null);

    try {
      const results = await busService.search(
        searchData.from,
        searchData.to,
        searchData.departure
      );

      console.log('Bus search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Bus search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="search-form bus-search">
      <div className="search-fields">
        <div className="field-group">
          <label>From</label>
          <DestinationDropdown
            type="bus_station"
            value={searchData.from}
            onChange={(id) => setSearchData({...searchData, from: id})}
            placeholder="Select departure station"
            required
          />
        </div>

        <div className="field-group">
          <label>To</label>
          <DestinationDropdown
            type="bus_station"
            value={searchData.to}
            onChange={(id) => setSearchData({...searchData, to: id})}
            placeholder="Select destination station"
            required
          />
        </div>

        <div className="field-group">
          <label>Departure</label>
          <input
            type="date"
            value={searchData.departure}
            onChange={(e) => setSearchData({...searchData, departure: e.target.value})}
            required
          />
        </div>

        <div className="field-group">
          <label>Passengers</label>
          <select
            value={searchData.passengers}
            onChange={(e) => setSearchData({...searchData, passengers: parseInt(e.target.value)})}
          >
            {[1,2,3,4,5,6].map(num => (
              <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      <button className="search-btn bus-btn" onClick={handleSearch}>
        Search Buses
      </button>
    </div>
  );
};

// Package Search Component
const PackageSearch = ({ setSearchResults, setIsSearching, setHasSearched }) => {
  const [searchData, setSearchData] = useState({
    destination: '',
    duration: '',
    type: '',
    budget: ''
  });

  const handleSearch = async () => {
    if (!searchData.destination) {
      alert('Please enter a destination');
      return;
    }

    console.log('Package search data:', searchData);
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults(null);

    try {
      const results = await packageService.search(
        searchData.destination,
        searchData.duration,
        searchData.type,
        searchData.budget
      );

      console.log('Package search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Package search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="search-form package-search">
      <div className="search-fields">
        <div className="field-group">
          <label>Destination</label>
          <input
            type="text"
            placeholder="Enter destination"
            value={searchData.destination}
            onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
            required
          />
        </div>

        <div className="field-group">
          <label>Duration</label>
          <select
            value={searchData.duration}
            onChange={(e) => setSearchData({...searchData, duration: e.target.value})}
          >
            <option value="">Any Duration</option>
            <option value="1-3">1-3 Days</option>
            <option value="4-7">4-7 Days</option>
            <option value="8-14">8-14 Days</option>
            <option value="15+">15+ Days</option>
          </select>
        </div>

        <div className="field-group">
          <label>Package Type</label>
          <select
            value={searchData.type}
            onChange={(e) => setSearchData({...searchData, type: e.target.value})}
          >
            <option value="">Any Type</option>
            <option value="adventure">Adventure</option>
            <option value="leisure">Leisure</option>
            <option value="family">Family</option>
            <option value="honeymoon">Honeymoon</option>
            <option value="business">Business</option>
          </select>
        </div>

        <div className="field-group">
          <label>Budget Range</label>
          <select
            value={searchData.budget}
            onChange={(e) => setSearchData({...searchData, budget: e.target.value})}
          >
            <option value="">Any Budget</option>
            <option value="0-10000">Under ₹10,000</option>
            <option value="10000-25000">₹10,000 - ₹25,000</option>
            <option value="25000-50000">₹25,000 - ₹50,000</option>
            <option value="50000+">Above ₹50,000</option>
          </select>
        </div>
      </div>

      <button className="search-btn package-btn" onClick={handleSearch}>
        Find Complete Packages
      </button>
    </div>
  );
};

export default TravelOptions;
