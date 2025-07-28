import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Flights = () => {
  const [searchData, setSearchData] = useState({
    origin: '',
    destination: '',
    departureDate: new Date().toISOString().split('T')[0],
    returnDate: '',
    passengers: 1,
    class: 'economy',
    tripType: 'one-way'
  });
  const [destinations, setDestinations] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [filteredOrigins, setFilteredOrigins] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDestinations();
    fetchPopularFlights();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/destinations/type/airport');
      if (response.ok) {
        const data = await response.json();
        setDestinations(data);
      } else {
        // Use mock data if API fails
        const mockDestinations = [
          { _id: "1", name: "Indira Gandhi International Airport", code: "DEL", city: "Delhi", state: "Delhi" },
          { _id: "2", name: "Chhatrapati Shivaji International Airport", code: "BOM", city: "Mumbai", state: "Maharashtra" },
          { _id: "3", name: "Kempegowda International Airport", code: "BLR", city: "Bangalore", state: "Karnataka" },
          { _id: "4", name: "Chennai International Airport", code: "MAA", city: "Chennai", state: "Tamil Nadu" },
          { _id: "5", name: "Netaji Subhas Chandra Bose International Airport", code: "CCU", city: "Kolkata", state: "West Bengal" }
        ];
        setDestinations(mockDestinations);
      }
    } catch (error) {
      console.error('Error fetching destinations, using mock data:', error);
      const mockDestinations = [
        { _id: "1", name: "Indira Gandhi International Airport", code: "DEL", city: "Delhi", state: "Delhi" },
        { _id: "2", name: "Chhatrapati Shivaji International Airport", code: "BOM", city: "Mumbai", state: "Maharashtra" },
        { _id: "3", name: "Kempegowda International Airport", code: "BLR", city: "Bangalore", state: "Karnataka" }
      ];
      setDestinations(mockDestinations);
    }
  };

  const fetchPopularFlights = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/flights');
      if (response.ok) {
        const data = await response.json();
        setFlights(data.flights || []);
      } else {
        // Use comprehensive mock data if API fails
        const mockFlights = [
          {
            _id: "1",
            airline: { name: "Air India", logo: "✈️" },
            flightNumber: "AI-101",
            route: {
              origin: { code: "DEL", city: "Delhi" },
              destination: { code: "BOM", city: "Mumbai" }
            },
            schedule: {
              departureTime: "06:00",
              arrivalTime: "08:30",
              duration: 150
            },
            pricing: {
              economy: { basePrice: 5500, taxes: 500 },
              business: { basePrice: 12000, taxes: 1000 },
              first: { basePrice: 25000, taxes: 2000 }
            }
          },
          {
            _id: "2",
            airline: { name: "IndiGo", logo: "🛩️" },
            flightNumber: "6E-202",
            route: {
              origin: { code: "DEL", city: "Delhi" },
              destination: { code: "BLR", city: "Bangalore" }
            },
            schedule: {
              departureTime: "14:30",
              arrivalTime: "17:00",
              duration: 150
            },
            pricing: {
              economy: { basePrice: 4800, taxes: 400 },
              business: { basePrice: 10500, taxes: 900 },
              first: { basePrice: 22000, taxes: 1800 }
            }
          },
          {
            _id: "3",
            airline: { name: "SpiceJet", logo: "🌶️" },
            flightNumber: "SG-303",
            route: {
              origin: { code: "BOM", city: "Mumbai" },
              destination: { code: "MAA", city: "Chennai" }
            },
            schedule: {
              departureTime: "09:15",
              arrivalTime: "11:00",
              duration: 105
            },
            pricing: {
              economy: { basePrice: 4200, taxes: 350 },
              business: { basePrice: 9800, taxes: 800 }
            }
          },
          {
            _id: "4",
            airline: { name: "Vistara", logo: "✨" },
            flightNumber: "UK-404",
            route: {
              origin: { code: "BLR", city: "Bangalore" },
              destination: { code: "CCU", city: "Kolkata" }
            },
            schedule: {
              departureTime: "16:45",
              arrivalTime: "19:20",
              duration: 155
            },
            pricing: {
              economy: { basePrice: 5800, taxes: 480 },
              business: { basePrice: 13500, taxes: 1100 },
              first: { basePrice: 28000, taxes: 2200 }
            }
          }
        ];
        setFlights(mockFlights);
      }
    } catch (error) {
      console.error('Error fetching flights, using mock data:', error);
      // Use comprehensive mock data as fallback
      const mockFlights = [
        {
          _id: "1",
          airline: { name: "Air India", logo: "✈️" },
          flightNumber: "AI-101",
          route: {
            origin: { code: "DEL", city: "Delhi" },
            destination: { code: "BOM", city: "Mumbai" }
          },
          schedule: {
            departureTime: "06:00",
            arrivalTime: "08:30",
            duration: 150
          },
          pricing: {
            economy: { basePrice: 5500, taxes: 500 },
            business: { basePrice: 12000, taxes: 1000 }
          }
        },
        {
          _id: "2",
          airline: { name: "IndiGo", logo: "🛩️" },
          flightNumber: "6E-202",
          route: {
            origin: { code: "DEL", city: "Delhi" },
            destination: { code: "BLR", city: "Bangalore" }
          },
          schedule: {
            departureTime: "14:30",
            arrivalTime: "17:00",
            duration: 150
          },
          pricing: {
            economy: { basePrice: 4800, taxes: 400 },
            business: { basePrice: 10500, taxes: 900 }
          }
        }
      ];
      setFlights(mockFlights);
    }
  };

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({ ...prev, [field]: value }));

    if (field === 'origin') {
      const filtered = destinations.filter(dest => 
        dest.name.toLowerCase().includes(value.toLowerCase()) ||
        dest.city.toLowerCase().includes(value.toLowerCase()) ||
        dest.code.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOrigins(filtered);
      setShowOriginDropdown(value.length > 0);
    }

    if (field === 'destination') {
      const filtered = destinations.filter(dest => 
        dest.name.toLowerCase().includes(value.toLowerCase()) ||
        dest.city.toLowerCase().includes(value.toLowerCase()) ||
        dest.code.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDestinations(filtered);
      setShowDestinationDropdown(value.length > 0);
    }
  };

  const selectDestination = (dest, type) => {
    if (type === 'origin') {
      setSearchData(prev => ({ 
        ...prev, 
        origin: dest._id,
        originDisplay: `${dest.name} (${dest.code}) - ${dest.city}`
      }));
      setShowOriginDropdown(false);
    } else {
      setSearchData(prev => ({ 
        ...prev, 
        destination: dest._id,
        destinationDisplay: `${dest.name} (${dest.code}) - ${dest.city}`
      }));
      setShowDestinationDropdown(false);
    }
  };

  const handleSearch = async () => {
    if (!searchData.origin || !searchData.destination) {
      alert('Please select both origin and destination');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        origin: searchData.origin,
        destination: searchData.destination,
        departureDate: searchData.departureDate,
        passengers: searchData.passengers,
        class: searchData.class
      });

      const response = await fetch(`http://localhost:5000/api/flights/search?${params}`);
      const data = await response.json();
      setFlights(data.flights || []);
    } catch (error) {
      console.error('Error searching flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookFlight = (flight) => {
    console.log('Booking flight:', flight);
    console.log('Search data:', searchData);

    navigate('/booking', {
      state: {
        travelType: 'flight',
        serviceData: flight,
        searchData: searchData
      }
    });
  };

  return (
    <div className="flights-page">
      <Navbar />

      <div className="flights-hero">
        <div className="hero-content">
          <h1>✈️ Discover Amazing Flights</h1>
          <p>Find the best deals and fly to your dream destinations with comfort and style</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Destinations</span>
            </div>
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Airlines</span>
            </div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flights-container">
        {/* Flight Search Form */}
        <div className="flight-search">
          <div className="search-header">
            <h2>Search Flights</h2>
            <div className="trip-type">
              <label>
                <input
                  type="radio"
                  name="tripType"
                  value="one-way"
                  checked={searchData.tripType === 'one-way'}
                  onChange={(e) => handleInputChange('tripType', e.target.value)}
                />
                One Way
              </label>
              <label>
                <input
                  type="radio"
                  name="tripType"
                  value="round-trip"
                  checked={searchData.tripType === 'round-trip'}
                  onChange={(e) => handleInputChange('tripType', e.target.value)}
                />
                Round Trip
              </label>
            </div>
          </div>

          <div className="search-form">
            <div className="form-row">
              <div className="form-group">
                <label>From</label>
                <div className="destination-input">
                  <input
                    type="text"
                    placeholder="Enter origin city or airport"
                    value={searchData.originDisplay || ''}
                    onChange={(e) => handleInputChange('origin', e.target.value)}
                    onFocus={() => setShowOriginDropdown(true)}
                  />
                  {showOriginDropdown && filteredOrigins.length > 0 && (
                    <div className="destination-dropdown">
                      {filteredOrigins.slice(0, 5).map(dest => (
                        <div
                          key={dest._id}
                          className="destination-option"
                          onClick={() => selectDestination(dest, 'origin')}
                        >
                          <div className="dest-main">{dest.name} ({dest.code})</div>
                          <div className="dest-sub">{dest.city}, {dest.state}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>To</label>
                <div className="destination-input">
                  <input
                    type="text"
                    placeholder="Enter destination city or airport"
                    value={searchData.destinationDisplay || ''}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    onFocus={() => setShowDestinationDropdown(true)}
                  />
                  {showDestinationDropdown && filteredDestinations.length > 0 && (
                    <div className="destination-dropdown">
                      {filteredDestinations.slice(0, 5).map(dest => (
                        <div
                          key={dest._id}
                          className="destination-option"
                          onClick={() => selectDestination(dest, 'destination')}
                        >
                          <div className="dest-main">{dest.name} ({dest.code})</div>
                          <div className="dest-sub">{dest.city}, {dest.state}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Departure Date</label>
                <input
                  type="date"
                  value={searchData.departureDate}
                  onChange={(e) => handleInputChange('departureDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {searchData.tripType === 'round-trip' && (
                <div className="form-group">
                  <label>Return Date</label>
                  <input
                    type="date"
                    value={searchData.returnDate}
                    onChange={(e) => handleInputChange('returnDate', e.target.value)}
                    min={searchData.departureDate}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Passengers</label>
                <select
                  value={searchData.passengers}
                  onChange={(e) => handleInputChange('passengers', e.target.value)}
                >
                  {[1,2,3,4,5,6,7,8,9].map(num => (
                    <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Class</label>
                <select
                  value={searchData.class}
                  onChange={(e) => handleInputChange('class', e.target.value)}
                >
                  <option value="economy">Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First Class</option>
                </select>
              </div>
            </div>

            <button className="search-btn" onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search Flights'}
            </button>
          </div>
        </div>

        {/* Flight Results */}
        <div className="flight-results">
          <h2>Available Flights</h2>
          {loading ? (
            <div className="loading">Searching for flights...</div>
          ) : flights.length > 0 ? (
            <div className="flights-list">
              {flights.map(flight => (
                <div key={flight._id} className="flight-card">
                  <div className="flight-info">
                    <div className="airline">
                      <h3>{flight.airline.logo || "✈️"} {flight.airline.name}</h3>
                      <p>{flight.flightNumber}</p>
                    </div>
                    <div className="timing">
                      <div className="departure">
                        <span className="time">{flight.schedule.departureTime}</span>
                        <span className="airport">{flight.route.origin.code}</span>
                      </div>
                      <div className="duration">
                        <span>{Math.floor(flight.schedule.duration / 60)}h {flight.schedule.duration % 60}m</span>
                        <div className="flight-path">✈️</div>
                      </div>
                      <div className="arrival">
                        <span className="time">{flight.schedule.arrivalTime}</span>
                        <span className="airport">{flight.route.destination.code}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flight-pricing">
                    <div className="price">
                      <span className="amount">₹{flight.pricing[searchData.class]?.basePrice + flight.pricing[searchData.class]?.taxes}</span>
                      <span className="per-person">per person</span>
                    </div>
                    <button
                      className="book-btn"
                      onClick={() => handleBookFlight(flight)}
                    >
                      🎫 Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No flights found. Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Flights;
