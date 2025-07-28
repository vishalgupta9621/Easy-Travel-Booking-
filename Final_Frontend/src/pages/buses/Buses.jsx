import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/footer';
import './buses.css';

const Buses = () => {
  const [searchData, setSearchData] = useState({
    origin: '',
    destination: '',
    departureDate: new Date().toISOString().split('T')[0],
    passengers: 1,
    busType: 'all'
  });
  const [destinations, setDestinations] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [filteredOrigins, setFilteredOrigins] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const navigate = useNavigate();

  const busTypes = [
    { value: 'all', label: 'All Bus Types' },
    { value: 'ac_seater', label: 'AC Seater' },
    { value: 'non_ac_seater', label: 'Non-AC Seater' },
    { value: 'ac_sleeper', label: 'AC Sleeper' },
    { value: 'non_ac_sleeper', label: 'Non-AC Sleeper' },
    { value: 'volvo', label: 'Volvo' },
    { value: 'luxury', label: 'Luxury' }
  ];

  useEffect(() => {
    fetchDestinations();
    fetchPopularBuses();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/destinations/type/bus_station');
      if (response.ok) {
        const data = await response.json();
        setDestinations(data);
      } else {
        const mockDestinations = [
          { _id: "1", name: "ISBT Kashmere Gate", city: "Delhi", state: "Delhi" },
          { _id: "2", name: "Mumbai Central Bus Station", city: "Mumbai", state: "Maharashtra" },
          { _id: "3", name: "Kempegowda Bus Station", city: "Bangalore", state: "Karnataka" }
        ];
        setDestinations(mockDestinations);
      }
    } catch (error) {
      console.error('Error fetching destinations, using mock data:', error);
      const mockDestinations = [
        { _id: "1", name: "ISBT Kashmere Gate", city: "Delhi", state: "Delhi" },
        { _id: "2", name: "Mumbai Central Bus Station", city: "Mumbai", state: "Maharashtra" }
      ];
      setDestinations(mockDestinations);
    }
  };

  const fetchPopularBuses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/buses');
      if (response.ok) {
        const data = await response.json();
        setBuses(data.buses || []);
      } else {
        const mockBuses = [
          {
            _id: "1",
            operator: { name: "RedBus Travels" },
            busNumber: "RB-101",
            busType: "ac_sleeper",
            route: {
              origin: { city: "Delhi" },
              destination: { city: "Mumbai" }
            },
            schedule: {
              departureTime: "20:00",
              arrivalTime: "12:00",
              duration: "16h"
            },
            seating: {
              totalSeats: 40,
              layout: "2+1"
            },
            amenities: [
              { name: "WiFi" },
              { name: "Charging Point" },
              { name: "Water Bottle" }
            ],
            basePrice: 1200,
            taxes: 100
          }
        ];
        setBuses(mockBuses);
      }
    } catch (error) {
      console.error('Error fetching buses, using mock data:', error);
      const mockBuses = [
        {
          _id: "1",
          operator: { name: "RedBus Travels" },
          busNumber: "RB-101",
          busType: "ac_sleeper",
          route: {
            origin: { city: "Delhi" },
            destination: { city: "Mumbai" }
          },
          schedule: {
            departureTime: "20:00",
            arrivalTime: "12:00",
            duration: "16h"
          },
          seating: {
            totalSeats: 40,
            layout: "2+1"
          },
          amenities: [
            { name: "WiFi" },
            { name: "AC" }
          ],
          basePrice: 1200,
          taxes: 100
        }
      ];
      setBuses(mockBuses);
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
        originDisplay: `${dest.name} - ${dest.city}`
      }));
      setShowOriginDropdown(false);
    } else {
      setSearchData(prev => ({ 
        ...prev, 
        destination: dest._id,
        destinationDisplay: `${dest.name} - ${dest.city}`
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
        passengers: searchData.passengers
      });

      if (searchData.busType !== 'all') {
        params.append('busType', searchData.busType);
      }

      const response = await fetch(`http://localhost:5000/api/buses/search?${params}`);
      const data = await response.json();
      setBuses(data.buses || []);
    } catch (error) {
      console.error('Error searching buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookBus = (bus) => {
    navigate('/booking', { 
      state: { 
        travelType: 'bus',
        serviceData: bus,
        searchData 
      } 
    });
  };

  const formatBusType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="buses-page">
      <Navbar />
      
      <div className="buses-hero">
        <div className="hero-content">
          <h1>Book Your Bus Journey</h1>
          <p>Comfortable and affordable bus travel across India</p>
        </div>
      </div>

      <div className="buses-container">
        {/* Bus Search Form */}
        <div className="bus-search">
          <div className="search-header">
            <h2>Search Buses</h2>
            <div className="redbus-info">
              <span>🚌 Trusted Bus Partner</span>
            </div>
          </div>

          <div className="search-form">
            <div className="form-row">
              <div className="form-group">
                <label>From</label>
                <div className="destination-input">
                  <input
                    type="text"
                    placeholder="Enter origin city"
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
                          <div className="dest-main">{dest.name}</div>
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
                    placeholder="Enter destination city"
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
                          <div className="dest-main">{dest.name}</div>
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
                <label>Travel Date</label>
                <input
                  type="date"
                  value={searchData.departureDate}
                  onChange={(e) => handleInputChange('departureDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Passengers</label>
                <select
                  value={searchData.passengers}
                  onChange={(e) => handleInputChange('passengers', e.target.value)}
                >
                  {[1,2,3,4,5,6].map(num => (
                    <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Bus Type</label>
                <select
                  value={searchData.busType}
                  onChange={(e) => handleInputChange('busType', e.target.value)}
                >
                  {busTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button className="search-btn" onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search Buses'}
            </button>
          </div>
        </div>

        {/* Bus Results */}
        <div className="bus-results">
          <h2>Available Buses</h2>
          {loading ? (
            <div className="loading">Searching for buses...</div>
          ) : buses.length > 0 ? (
            <div className="buses-list">
              {buses.map(bus => (
                <div key={bus._id} className="bus-card">
                  <div className="bus-info">
                    <div className="bus-details">
                      <h3>{bus.operator.name}</h3>
                      <p>{bus.busNumber} • {formatBusType(bus.busType)}</p>
                      <div className="bus-features">
                        {bus.amenities.slice(0, 3).map(amenity => (
                          <span key={amenity.name} className="feature-tag">
                            {amenity.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="timing">
                      <div className="departure">
                        <span className="time">{bus.schedule.departureTime}</span>
                        <span className="location">{bus.route.origin.city}</span>
                      </div>
                      <div className="duration">
                        <span>{bus.schedule.duration}</span>
                        <div className="bus-path">🚌</div>
                      </div>
                      <div className="arrival">
                        <span className="time">{bus.schedule.arrivalTime}</span>
                        <span className="location">{bus.route.destination.city}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bus-pricing">
                    <div className="seating-info">
                      <span className="seats-available">{bus.seating.totalSeats} seats</span>
                      <span className="layout">{bus.seating.layout} layout</span>
                    </div>
                    <div className="price">
                      <span className="amount">₹{bus.basePrice + bus.taxes}</span>
                      <span className="per-person">per person</span>
                    </div>
                    <button 
                      className="book-btn"
                      onClick={() => handleBookBus(bus)}
                    >
                      Select Seats
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No buses found. Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Buses;
