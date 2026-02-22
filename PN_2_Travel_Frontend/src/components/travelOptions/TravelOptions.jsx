import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hotelService, flightService, trainService, busService, packageService } from '../../services/api.service';
import DestinationDropdown from '../common/DestinationDropdown';
import BookingOptionsModal from '../common/BookingOptionsModal';
import './travelOptions.css';

// Search Results Component (moved outside to fix hook usage)
const SearchResults = ({ results, type, searchData }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

  console.log('🎯 SearchResults component rendered with:', { results, type, searchData });

  if (!results || results.length === 0) {
    console.log('❌ No results to display');
    return (
      <div className="no-results">
        <p>No {type} found matching your criteria.</p>
      </div>
    );
  }

  console.log('✅ Displaying', results.length, type, 'results');

  const handleViewHotel = (hotel) => {
    console.log('View Hotel clicked for:', hotel);
    setSelectedHotel(hotel);
    setIsModalOpen(true);
  };

  const handleModalConfirm = (bookingData) => {
    console.log('Hotel booking data:', bookingData);

    // Store hotel data and booking preferences for viewing
    const hotelWithBookingData = {
      ...selectedHotel,
      bookingPreferences: bookingData
    };

    localStorage.setItem('viewingHotel', JSON.stringify(hotelWithBookingData));
    localStorage.setItem('hotelBookingData', JSON.stringify(bookingData));

    // Close modal and navigate to hotel details page
    setIsModalOpen(false);
    setSelectedHotel(null);
    navigate(`/hotel/${selectedHotel._id}`);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedHotel(null);
  };

  const handleBooking = (bookingType, item) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login page
      navigate('/login');
      return;
    }

    // Store booking data in localStorage with search parameters based on booking type
    const bookingData = {
      type: bookingType,
      item: item,
      timestamp: new Date().toISOString()
    };

    // Add type-specific search data
    if (searchData) {
      if (bookingType === 'hotel') {
        bookingData.checkIn = searchData.checkIn;
        bookingData.checkOut = searchData.checkOut;
        bookingData.guests = searchData.guests;
        bookingData.rooms = searchData.rooms;
        bookingData.destination = searchData.destination;
      } else if (bookingType === 'flight' || bookingType === 'train' || bookingType === 'bus') {
        bookingData.from = searchData.from;
        bookingData.to = searchData.to;
        bookingData.departure = searchData.departure;
        bookingData.return = searchData.return; // For flights
        bookingData.passengers = searchData.passengers;
        bookingData.class = searchData.class;
        // Set travel date to departure date for travel bookings
        bookingData.travelDate = searchData.departure;
      } else if (bookingType === 'package') {
        bookingData.from = searchData.from;
        bookingData.destination = searchData.destination;
        bookingData.startDate = searchData.startDate;
        bookingData.endDate = searchData.endDate;
        bookingData.travelers = searchData.travelers;
        bookingData.transport = searchData.transport;
        bookingData.budget = searchData.budget;
        // Set travel date to start date for packages
        bookingData.travelDate = searchData.startDate;
      }
    }

    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));

    // Navigate to booking details page
    navigate(`/booking/${bookingType}/${item._id || 'demo'}`);
  };

  console.log('SearchResults component - type:', type, 'results:', results);

  return (
    <div className="search-results">
      <div className="results-header">
        <h2>Search Results</h2>
        <p>{results.length} {type} found</p>
      </div>
      <div className="results-grid">
        {results.map((item, index) => {
          console.log(`Rendering ${type} item ${index}:`, item);
          return (
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
                    <span className="departure">{item.route?.origin?.city || item.route?.origin || searchData?.from || 'Origin'}</span>
                    <span className="route-arrow">→</span>
                    <span className="arrival">{item.route?.destination?.city || item.route?.destination || searchData?.to || 'Destination'}</span>
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
                        <span className="price-amount">₹{item.pricing?.economy?.basePrice || '5,999'}</span>
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
                <p>🚂 {item.route?.origin?.city || item.route?.origin || searchData?.from || 'Origin'} → {item.route?.destination?.city || item.route?.destination || searchData?.to || 'Destination'}</p>
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
                <p>🚌 {item.route?.origin?.city || item.route?.origin || searchData?.from || 'Origin'} → {item.route?.destination?.city || item.route?.destination || searchData?.to || 'Destination'}</p>
                <p>🕐 {item.schedule?.departureTime} - {item.schedule?.arrivalTime}</p>
                <p>🚌 {item.busType}</p>
                <p>💰 ₹{item.pricing?.economy?.basePrice || '1,299'}</p>
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
                <div className="result-image">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400';
                      }}
                    />
                  ) : (
                    <div className="placeholder-image">
                      🎒
                    </div>
                  )}
                </div>
                <div className="result-content">
                  <h3>{item.name}</h3>
                  <div className="package-info">
                    <p>📅 {item.duration} days</p>
                    <p>📍 {item.destinations?.join(', ')}</p>
                    <p>🎯 {item.type}</p>
                    <p>💰 Starting from ₹{item.basePrice || item.price}</p>
                  </div>
                  <div className="description">
                    {item.description}
                  </div>
                  <div className="package-actions">
                    <button
                      className="view-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        alert('View Details button clicked!');
                        console.log('View Details clicked for package:', item);
                        // Store search results for package details page
                        localStorage.setItem('searchResults', JSON.stringify(results));
                        navigate(`/package/${item._id || item.id}`);
                      }}
                      style={{ pointerEvents: 'auto', zIndex: 10 }}
                    >
                      View Details
                    </button>
                    <button
                      className="book-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        alert('Book Package button clicked!');
                        console.log('Book Package clicked for package:', item);
                        if (!isAuthenticated) {
                          navigate('/login');
                          return;
                        }
                        navigate(`/package-booking/${item._id || item.id}`);
                      }}
                      style={{ pointerEvents: 'auto', zIndex: 10 }}
                    >
                      Book Package
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          );
        })}
      </div>

      {type === 'hotels' && (
        <BookingOptionsModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onConfirm={handleModalConfirm}
          hotel={selectedHotel}
        />
      )}
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
        {activeTab === 'flights' && <FlightSearch setSearchResults={setSearchResults} setIsSearching={setIsSearching} setHasSearched={setHasSearched} setCurrentSearchData={setCurrentSearchData} />}
        {activeTab === 'trains' && <TrainSearch setSearchResults={setSearchResults} setIsSearching={setIsSearching} setHasSearched={setHasSearched} setCurrentSearchData={setCurrentSearchData} />}
        {activeTab === 'buses' && <BusSearch setSearchResults={setSearchResults} setIsSearching={setIsSearching} setHasSearched={setHasSearched} setCurrentSearchData={setCurrentSearchData} />}
        {activeTab === 'packages' && <PackageSearch setSearchResults={setSearchResults} setIsSearching={setIsSearching} setHasSearched={setHasSearched} setCurrentSearchData={setCurrentSearchData} />}
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
          {(() => {
            console.log('🔍 Search results section render:', {
              hasSearched,
              isSearching,
              searchResults: searchResults ? searchResults.length : 'null',
              activeTab
            });

            if (isSearching) {
              return (
                <div className="loading-results">
                  <div className="loading-spinner"></div>
                  <p>Searching for the best options...</p>
                </div>
              );
            } else if (searchResults && searchResults.length > 0) {
              return <SearchResults results={searchResults} type={activeTab} searchData={currentSearchData} />;
            } else {
              return (
                <div className="no-results">
                  <p>No results found. Please try different search criteria.</p>
                </div>
              );
            }
          })()}
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
    // Enhanced validation
    const errors = [];

    if (!searchData.destination.trim()) {
      errors.push('Destination is required');
    }

    if (!searchData.checkIn) {
      errors.push('Check-in date is required');
    }

    if (!searchData.checkOut) {
      errors.push('Check-out date is required');
    }

    if (searchData.checkIn && searchData.checkOut) {
      const checkInDate = new Date(searchData.checkIn);
      const checkOutDate = new Date(searchData.checkOut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkInDate < today) {
        errors.push('Check-in date cannot be in the past');
      }

      if (checkOutDate <= checkInDate) {
        errors.push('Check-out date must be after check-in date');
      }
    }

    if (errors.length > 0) {
      alert('Please fix the following errors:\n• ' + errors.join('\n• '));
      return;
    }

    console.log('🔍 Hotel search started with data:', searchData);
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults(null);
    setCurrentSearchData(searchData); // Store search data for booking

    console.log('🔄 Search states set - isSearching: true, hasSearched: true');

    try {
      const searchParams = {
        city: searchData.destination,
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        guests: searchData.guests,
        rooms: searchData.rooms
      };

      let results = [];

      try {
        results = await hotelService.search(searchParams);
        console.log('✅ Hotel search results from API:', results);
      } catch (apiError) {
        console.log('⚠️ API error, using mock data:', apiError);

        // Mock hotel data for demonstration
        results = [
          {
            _id: 'hotel-1',
            name: 'Taj Mahal Palace Mumbai',
            city: searchData.destination,
            desc: 'Luxury heritage hotel with stunning views of the Gateway of India',
            cheapestPrice: 15000,
            rating: 4.8,
            photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400']
          },
          {
            _id: 'hotel-2',
            name: `Grand Hotel ${searchData.destination}`,
            city: searchData.destination,
            desc: 'Modern luxury hotel in the heart of the city with world-class amenities',
            cheapestPrice: 8500,
            rating: 4.5,
            photos: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400']
          },
          {
            _id: 'hotel-3',
            name: `Business Inn ${searchData.destination}`,
            city: searchData.destination,
            desc: 'Comfortable business hotel with excellent connectivity and modern facilities',
            cheapestPrice: 5500,
            rating: 4.2,
            photos: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400']
          }
        ];
      }

      console.log('🎯 Setting hotel search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('❌ Hotel search error:', error);
      setSearchResults([]);
    } finally {
      console.log('✅ Hotel search completed, setting isSearching to false');
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
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="field-group">
          <label>Check-out</label>
          <input
            type="date"
            value={searchData.checkOut}
            onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
            min={searchData.checkIn || new Date().toISOString().split('T')[0]}
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
const FlightSearch = ({ setSearchResults, setIsSearching, setHasSearched, setCurrentSearchData }) => {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    departure: '',
    return: '',
    passengers: 1,
    class: 'economy'
  });

  const handleSearch = async () => {
    // Enhanced validation
    const errors = [];

    if (!searchData.from) {
      errors.push('Departure airport is required');
    }

    if (!searchData.to) {
      errors.push('Destination airport is required');
    }

    if (searchData.from && searchData.to && searchData.from === searchData.to) {
      errors.push('Departure and destination airports cannot be the same');
    }

    if (!searchData.departure) {
      errors.push('Departure date is required');
    }

    if (searchData.departure) {
      const departureDate = new Date(searchData.departure);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (departureDate < today) {
        errors.push('Departure date cannot be in the past');
      }
    }

    if (searchData.return && searchData.departure) {
      const departureDate = new Date(searchData.departure);
      const returnDate = new Date(searchData.return);

      if (returnDate <= departureDate) {
        errors.push('Return date must be after departure date');
      }
    }

    if (errors.length > 0) {
      alert('Please fix the following errors:\n• ' + errors.join('\n• '));
      return;
    }

    console.log('Flight search data:', searchData);
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults(null);
    setCurrentSearchData(searchData); // Store search data for booking

    try {
      let results = [];

      try {
        results = await flightService.search(
          searchData.from,
          searchData.to,
          searchData.departure,
          searchData.return || null
        );
        console.log('Flight search results from API:', results);
      } catch (apiError) {
        console.log('API error, using mock data:', apiError);

        // Mock flight data for demonstration
        results = [
          {
            _id: 'flight-1',
            flightNumber: 'AI101',
            airline: { name: 'Air India', code: 'AI' },
            aircraft: { model: 'Boeing 737' },
            route: {
              origin: { city: 'Delhi' },
              destination: { city: 'Mumbai' }
            },
            schedule: {
              departureTime: '09:00',
              arrivalTime: '11:30',
              duration: 150
            },
            pricing: {
              economy: { basePrice: 5500 }
            }
          },
          {
            _id: 'flight-2',
            flightNumber: 'SG201',
            airline: { name: 'SpiceJet', code: 'SG' },
            aircraft: { model: 'Boeing 737' },
            route: {
              origin: { city: 'Delhi' },
              destination: { city: 'Mumbai' }
            },
            schedule: {
              departureTime: '14:00',
              arrivalTime: '16:30',
              duration: 150
            },
            pricing: {
              economy: { basePrice: 4800 }
            }
          },
          {
            _id: 'flight-3',
            flightNumber: 'UK301',
            airline: { name: 'Vistara', code: 'UK' },
            aircraft: { model: 'Airbus A320' },
            route: {
              origin: { city: 'Delhi' },
              destination: { city: 'Mumbai' }
            },
            schedule: {
              departureTime: '18:30',
              arrivalTime: '21:00',
              duration: 150
            },
            pricing: {
              economy: { basePrice: 6200 }
            }
          }
        ];
      }

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
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="field-group">
          <label>Return (Optional)</label>
          <input
            type="date"
            value={searchData.return}
            onChange={(e) => setSearchData({...searchData, return: e.target.value})}
            min={searchData.departure || new Date().toISOString().split('T')[0]}
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
const TrainSearch = ({ setSearchResults, setIsSearching, setHasSearched, setCurrentSearchData }) => {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    departure: '',
    passengers: 1,
    class: 'sleeper'
  });

  const handleSearch = async () => {
    // Enhanced validation
    const errors = [];

    if (!searchData.from) {
      errors.push('Departure station is required');
    }

    if (!searchData.to) {
      errors.push('Destination station is required');
    }

    if (searchData.from && searchData.to && searchData.from === searchData.to) {
      errors.push('Departure and destination stations cannot be the same');
    }

    if (!searchData.departure) {
      errors.push('Departure date is required');
    }

    if (searchData.departure) {
      const departureDate = new Date(searchData.departure);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (departureDate < today) {
        errors.push('Departure date cannot be in the past');
      }
    }

    if (errors.length > 0) {
      alert('Please fix the following errors:\n• ' + errors.join('\n• '));
      return;
    }

    console.log('Train search data:', searchData);
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults(null);
    setCurrentSearchData(searchData); // Store search data for booking

    try {
      let results = [];

      try {
        results = await trainService.search(
          searchData.from,
          searchData.to,
          searchData.departure
        );
        console.log('Train search results from API:', results);
      } catch (apiError) {
        console.log('API error, using mock data:', apiError);

        // Mock train data for demonstration
        results = [
          {
            _id: 'train-1',
            trainName: 'Rajdhani Express',
            trainNumber: '12951',
            route: {
              origin: { city: 'Delhi' },
              destination: { city: 'Mumbai' }
            },
            schedule: {
              departureTime: '16:55',
              arrivalTime: '08:35',
              duration: 945
            },
            pricing: {
              sleeper: { basePrice: 1200 },
              ac3: { basePrice: 2100 },
              ac2: { basePrice: 3200 },
              ac1: { basePrice: 4800 }
            }
          },
          {
            _id: 'train-2',
            trainName: 'Punjab Mail',
            trainNumber: '12137',
            route: {
              origin: { city: 'Delhi' },
              destination: { city: 'Mumbai' }
            },
            schedule: {
              departureTime: '23:30',
              arrivalTime: '22:15',
              duration: 1365
            },
            pricing: {
              sleeper: { basePrice: 800 },
              ac3: { basePrice: 1500 },
              ac2: { basePrice: 2400 }
            }
          },
          {
            _id: 'train-3',
            trainName: 'Grand Trunk Express',
            trainNumber: '12615',
            route: {
              origin: { city: 'Delhi' },
              destination: { city: 'Mumbai' }
            },
            schedule: {
              departureTime: '07:40',
              arrivalTime: '03:20',
              duration: 1180
            },
            pricing: {
              sleeper: { basePrice: 750 },
              ac3: { basePrice: 1400 }
            }
          }
        ];
      }

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
            min={new Date().toISOString().split('T')[0]}
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
const BusSearch = ({ setSearchResults, setIsSearching, setHasSearched, setCurrentSearchData }) => {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    departure: '',
    passengers: 1
  });

  const handleSearch = async () => {
    // Enhanced validation
    const errors = [];

    if (!searchData.from) {
      errors.push('Departure station is required');
    }

    if (!searchData.to) {
      errors.push('Destination station is required');
    }

    if (searchData.from && searchData.to && searchData.from === searchData.to) {
      errors.push('Departure and destination stations cannot be the same');
    }

    if (!searchData.departure) {
      errors.push('Departure date is required');
    }

    if (searchData.departure) {
      const departureDate = new Date(searchData.departure);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (departureDate < today) {
        errors.push('Departure date cannot be in the past');
      }
    }

    if (errors.length > 0) {
      alert('Please fix the following errors:\n• ' + errors.join('\n• '));
      return;
    }

    console.log('Bus search data:', searchData);
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults(null);
    setCurrentSearchData(searchData); // Store search data for booking

    try {
      let results = [];

      try {
        results = await busService.search(
          searchData.from,
          searchData.to,
          searchData.departure
        );
        console.log('Bus search results from API:', results);
      } catch (apiError) {
        console.log('API error, using mock data:', apiError);

        // Mock bus data for demonstration
        results = [
          {
            _id: 'bus-1',
            operator: 'RedBus Travels',
            busNumber: 'RB001',
            busType: 'AC Sleeper',
            route: {
              origin: { city: 'Delhi' },
              destination: { city: 'Mumbai' }
            },
            schedule: {
              departureTime: '20:00',
              arrivalTime: '12:00',
              duration: 960
            },
            pricing: {
              economy: { basePrice: 1200 }
            }
          },
          {
            _id: 'bus-2',
            operator: 'Volvo Express',
            busNumber: 'VE202',
            busType: 'Volvo Multi-Axle',
            route: {
              origin: { city: 'Delhi' },
              destination: { city: 'Mumbai' }
            },
            schedule: {
              departureTime: '22:30',
              arrivalTime: '14:30',
              duration: 960
            },
            pricing: {
              economy: { basePrice: 1500 }
            }
          },
          {
            _id: 'bus-3',
            operator: 'Luxury Coaches',
            busNumber: 'LC303',
            busType: 'AC Semi-Sleeper',
            route: {
              origin: { city: 'Delhi' },
              destination: { city: 'Mumbai' }
            },
            schedule: {
              departureTime: '18:00',
              arrivalTime: '10:00',
              duration: 960
            },
            pricing: {
              economy: { basePrice: 900 }
            }
          }
        ];
      }

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
            min={new Date().toISOString().split('T')[0]}
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
const PackageSearch = ({ setSearchResults, setIsSearching, setHasSearched, setCurrentSearchData }) => {
  const [searchData, setSearchData] = useState({
    from: '',
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    transport: 'any',
    budget: 'medium'
  });

  const handleSearch = async () => {
    // Enhanced validation
    const errors = [];

    if (!searchData.from.trim()) {
      errors.push('Departure city is required');
    }

    if (!searchData.destination.trim()) {
      errors.push('Destination is required');
    }

    if (searchData.from && searchData.destination &&
        searchData.from.toLowerCase() === searchData.destination.toLowerCase()) {
      errors.push('Departure and destination cannot be the same');
    }

    if (!searchData.startDate) {
      errors.push('Start date is required');
    }

    if (!searchData.endDate) {
      errors.push('End date is required');
    }

    if (searchData.startDate && searchData.endDate) {
      const startDate = new Date(searchData.startDate);
      const endDate = new Date(searchData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        errors.push('Start date cannot be in the past');
      }

      if (endDate <= startDate) {
        errors.push('End date must be after start date');
      }

      // Check if the trip is too short (less than 1 day)
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 1) {
        errors.push('Package duration must be at least 1 day');
      }
    }

    if (errors.length > 0) {
      alert('Please fix the following errors:\n• ' + errors.join('\n• '));
      return;
    }

    console.log('Package search data:', searchData);
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults(null);
    setCurrentSearchData(searchData); // Store search data for booking

    try {
      const searchParams = {
        from: searchData.from,
        destination: searchData.destination,
        startDate: searchData.startDate,
        endDate: searchData.endDate,
        travelers: searchData.travelers,
        transport: searchData.transport,
        budget: searchData.budget
      };

      // For testing, let's add some mock data
      const mockPackages = [
        {
          _id: 'test-package-1',
          id: 'test-package-1',
          name: 'Goa Beach Package',
          description: 'Enjoy beautiful beaches and vibrant nightlife',
          destinations: ['Goa'],
          type: 'leisure',
          duration: 5,
          basePrice: 15000,
          price: 15000,
          images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400']
        },
        {
          _id: 'test-package-2',
          id: 'test-package-2',
          name: 'Kerala Backwaters',
          description: 'Experience serene backwaters and houseboats',
          destinations: ['Kerala'],
          type: 'leisure',
          duration: 4,
          basePrice: 12000,
          price: 12000,
          images: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400']
        }
      ];

      try {
        const results = await packageService.search(searchParams);
        console.log('Package search results:', results);

        // If no results from API, use mock data for testing
        if (!results || results.length === 0) {
          console.log('No API results, using mock data');
          setSearchResults(mockPackages);
        } else {
          setSearchResults(results);
        }
      } catch (apiError) {
        console.log('API error, using mock data:', apiError);
        setSearchResults(mockPackages);
      }
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
          <label>From</label>
          <DestinationDropdown
            value={searchData.from}
            onChange={(value) => setSearchData({...searchData, from: value})}
            placeholder="Departure city"
          />
        </div>

        <div className="field-group">
          <label>Destination</label>
          <DestinationDropdown
            value={searchData.destination}
            onChange={(value) => setSearchData({...searchData, destination: value})}
            placeholder="Where to?"
          />
        </div>

        <div className="field-group">
          <label>Start Date</label>
          <input
            type="date"
            value={searchData.startDate}
            onChange={(e) => setSearchData({...searchData, startDate: e.target.value})}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="field-group">
          <label>End Date</label>
          <input
            type="date"
            value={searchData.endDate}
            onChange={(e) => setSearchData({...searchData, endDate: e.target.value})}
            min={searchData.startDate || new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="field-group">
          <label>Travelers</label>
          <select
            value={searchData.travelers}
            onChange={(e) => setSearchData({...searchData, travelers: parseInt(e.target.value)})}
          >
            {[1,2,3,4,5,6,7,8].map(num => (
              <option key={num} value={num}>{num} Traveler{num > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label>Transport</label>
          <select
            value={searchData.transport}
            onChange={(e) => setSearchData({...searchData, transport: e.target.value})}
          >
            <option value="any">Any Transport</option>
            <option value="flight">Flight</option>
            <option value="train">Train</option>
            <option value="bus">Bus</option>
          </select>
        </div>

        <div className="field-group">
          <label>Budget</label>
          <select
            value={searchData.budget}
            onChange={(e) => setSearchData({...searchData, budget: e.target.value})}
          >
            <option value="budget">Budget (₹5K-15K)</option>
            <option value="medium">Medium (₹15K-30K)</option>
            <option value="luxury">Luxury (₹30K+)</option>
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
