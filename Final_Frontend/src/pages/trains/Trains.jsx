import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/footer';
import './trains.css';

const Trains = () => {
  const [searchData, setSearchData] = useState({
    origin: '',
    destination: '',
    departureDate: new Date().toISOString().split('T')[0],
    passengers: 1,
    class: 'SL'
  });
  const [destinations, setDestinations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [filteredOrigins, setFilteredOrigins] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const navigate = useNavigate();

  const trainClasses = [
    { code: 'SL', name: 'Sleeper (SL)', description: 'Basic sleeper class' },
    { code: '3A', name: 'Third AC (3A)', description: 'Air conditioned 3-tier' },
    { code: '2A', name: 'Second AC (2A)', description: 'Air conditioned 2-tier' },
    { code: '1A', name: 'First AC (1A)', description: 'Premium air conditioned' },
    { code: 'CC', name: 'Chair Car (CC)', description: 'Air conditioned seating' }
  ];

  useEffect(() => {
    fetchDestinations();
    fetchPopularTrains();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/destinations/type/railway_station');
      if (response.ok) {
        const data = await response.json();
        setDestinations(data);
      } else {
        const mockDestinations = [
          { _id: "1", name: "New Delhi Railway Station", code: "NDLS", city: "Delhi", state: "Delhi" },
          { _id: "2", name: "Mumbai Central", code: "BCT", city: "Mumbai", state: "Maharashtra" },
          { _id: "3", name: "Bangalore City Railway Station", code: "SBC", city: "Bangalore", state: "Karnataka" }
        ];
        setDestinations(mockDestinations);
      }
    } catch (error) {
      console.error('Error fetching destinations, using mock data:', error);
      const mockDestinations = [
        { _id: "1", name: "New Delhi Railway Station", code: "NDLS", city: "Delhi", state: "Delhi" },
        { _id: "2", name: "Mumbai Central", code: "BCT", city: "Mumbai", state: "Maharashtra" }
      ];
      setDestinations(mockDestinations);
    }
  };

  const fetchPopularTrains = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trains');
      if (response.ok) {
        const data = await response.json();
        setTrains(data.trains || []);
      } else {
        const mockTrains = [
          {
            _id: "1",
            trainName: "Rajdhani Express",
            trainNumber: "12951",
            trainType: "Superfast",
            route: {
              origin: { code: "NDLS", city: "Delhi" },
              destination: { code: "BCT", city: "Mumbai" }
            },
            schedule: {
              departureTime: "16:55",
              arrivalTime: "08:35",
              duration: "15h 40m"
            },
            classes: [
              { code: "1A", name: "First AC", basePrice: 4500, totalSeats: 18 },
              { code: "2A", name: "Second AC", basePrice: 3200, totalSeats: 46 },
              { code: "3A", name: "Third AC", basePrice: 2300, totalSeats: 64 }
            ]
          }
        ];
        setTrains(mockTrains);
      }
    } catch (error) {
      console.error('Error fetching trains, using mock data:', error);
      const mockTrains = [
        {
          _id: "1",
          trainName: "Rajdhani Express",
          trainNumber: "12951",
          trainType: "Superfast",
          route: {
            origin: { code: "NDLS", city: "Delhi" },
            destination: { code: "BCT", city: "Mumbai" }
          },
          schedule: {
            departureTime: "16:55",
            arrivalTime: "08:35",
            duration: "15h 40m"
          },
          classes: [
            { code: "2A", name: "Second AC", basePrice: 3200, totalSeats: 46 }
          ]
        }
      ];
      setTrains(mockTrains);
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

      const response = await fetch(`http://localhost:5000/api/trains/search?${params}`);
      const data = await response.json();
      setTrains(data.trains || []);
    } catch (error) {
      console.error('Error searching trains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookTrain = (train, selectedClass) => {
    navigate('/booking', { 
      state: { 
        travelType: 'train',
        serviceData: train,
        selectedClass,
        searchData 
      } 
    });
  };

  return (
    <div className="trains-page">
      <Navbar />
      
      <div className="trains-hero">
        <div className="hero-content">
          <h1>Book Your Train Journey</h1>
          <p>Travel across India with comfort and convenience</p>
        </div>
      </div>

      <div className="trains-container">
        {/* Train Search Form */}
        <div className="train-search">
          <div className="search-header">
            <h2>Search Trains</h2>
            <div className="irctc-info">
              <span>🚂 IRCTC Authorized Partner</span>
            </div>
          </div>

          <div className="search-form">
            <div className="form-row">
              <div className="form-group">
                <label>From Station</label>
                <div className="destination-input">
                  <input
                    type="text"
                    placeholder="Enter origin station"
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
                <label>To Station</label>
                <div className="destination-input">
                  <input
                    type="text"
                    placeholder="Enter destination station"
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
                <label>Journey Date</label>
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
                <label>Preferred Class</label>
                <select
                  value={searchData.class}
                  onChange={(e) => handleInputChange('class', e.target.value)}
                >
                  {trainClasses.map(cls => (
                    <option key={cls.code} value={cls.code}>{cls.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button className="search-btn" onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search Trains'}
            </button>
          </div>
        </div>

        {/* Train Results */}
        <div className="train-results">
          <h2>Available Trains</h2>
          {loading ? (
            <div className="loading">Searching for trains...</div>
          ) : trains.length > 0 ? (
            <div className="trains-list">
              {trains.map(train => (
                <div key={train._id} className="train-card">
                  <div className="train-info">
                    <div className="train-details">
                      <h3>{train.trainName}</h3>
                      <p>{train.trainNumber} • {train.trainType}</p>
                    </div>
                    <div className="timing">
                      <div className="departure">
                        <span className="time">{train.schedule.departureTime}</span>
                        <span className="station">{train.route.origin.code}</span>
                      </div>
                      <div className="duration">
                        <span>{train.schedule.duration}</span>
                        <div className="train-path">🚂</div>
                      </div>
                      <div className="arrival">
                        <span className="time">{train.schedule.arrivalTime}</span>
                        <span className="station">{train.route.destination.code}</span>
                      </div>
                    </div>
                  </div>
                  <div className="train-classes">
                    {train.classes.map(cls => (
                      <div key={cls.code} className="class-option">
                        <div className="class-info">
                          <span className="class-name">{cls.name}</span>
                          <span className="class-price">₹{cls.basePrice}</span>
                          <span className="seats-available">{cls.totalSeats} seats</span>
                        </div>
                        <button 
                          className="book-btn"
                          onClick={() => handleBookTrain(train, cls)}
                        >
                          Book
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No trains found. Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Trains;
