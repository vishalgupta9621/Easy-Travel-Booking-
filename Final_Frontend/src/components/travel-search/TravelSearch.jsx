import { useState, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import axios from 'axios';
import './TravelSearch.css';

const TravelSearch = ({ onSearch }) => {
  const [activeTab, setActiveTab] = useState('flights');
  const [searchData, setSearchData] = useState({
    origin: '',
    destination: '',
    departureDate: new Date(),
    returnDate: new Date(),
    passengers: 1,
    class: 'economy',
    tripType: 'oneWay'
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassengerPicker, setShowPassengerPicker] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [filteredOrigins, setFilteredOrigins] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  const [dates, setDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  // Fetch destinations on component mount
  useEffect(() => {
    fetchDestinations();
  }, [activeTab]);

  const fetchDestinations = async () => {
    try {
      const typeMap = {
        flights: 'airport',
        trains: 'railway_station',
        buses: 'bus_station'
      };
      
      const response = await axios.get(`http://localhost:5000/api/destinations/type/${typeMap[activeTab]}`);
      setDestinations(response.data);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));

    // Filter destinations for autocomplete
    if (field === 'origin') {
      // Update the display value for origin
      setSearchData(prev => ({
        ...prev,
        originDisplay: value
      }));

      const filtered = destinations.filter(dest =>
        dest.name.toLowerCase().includes(value.toLowerCase()) ||
        dest.city.toLowerCase().includes(value.toLowerCase()) ||
        dest.code.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOrigins(filtered);
      setShowOriginDropdown(value.length > 0);
    }

    if (field === 'destination') {
      // Update the display value for destination
      setSearchData(prev => ({
        ...prev,
        destinationDisplay: value
      }));

      const filtered = destinations.filter(dest =>
        dest.name.toLowerCase().includes(value.toLowerCase()) ||
        dest.city.toLowerCase().includes(value.toLowerCase()) ||
        dest.code.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDestinations(filtered);
      setShowDestinationDropdown(value.length > 0);
    }
  };

  const selectDestination = (dest, field) => {
    setSearchData(prev => ({
      ...prev,
      [field]: dest._id,
      [`${field}Display`]: `${dest.name} (${dest.code}) - ${dest.city}`
    }));
    
    if (field === 'origin') {
      setShowOriginDropdown(false);
    } else {
      setShowDestinationDropdown(false);
    }
  };

  const swapDestinations = () => {
    setSearchData(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
      originDisplay: prev.destinationDisplay,
      destinationDisplay: prev.originDisplay
    }));
  };

  const handleDateChange = (item) => {
    setDates([item.selection]);
    setSearchData(prev => ({
      ...prev,
      departureDate: item.selection.startDate,
      returnDate: item.selection.endDate
    }));
  };

  const handlePassengerChange = (operation) => {
    setSearchData(prev => ({
      ...prev,
      passengers: operation === 'inc' 
        ? Math.min(prev.passengers + 1, 9) 
        : Math.max(prev.passengers - 1, 1)
    }));
  };

  const handleSearch = () => {
    if (!searchData.origin || !searchData.destination) {
      alert('Please select both origin and destination');
      return;
    }

    const searchParams = {
      ...searchData,
      travelType: activeTab.slice(0, -1) // Remove 's' from flights/trains/buses
    };

    onSearch(searchParams);
  };

  const getClassOptions = () => {
    switch (activeTab) {
      case 'flights':
        return [
          { value: 'economy', label: 'Economy' },
          { value: 'business', label: 'Business' },
          { value: 'first', label: 'First Class' }
        ];
      case 'trains':
        return [
          { value: 'SL', label: 'Sleeper (SL)' },
          { value: '3A', label: '3rd AC (3A)' },
          { value: '2A', label: '2nd AC (2A)' },
          { value: '1A', label: '1st AC (1A)' },
          { value: 'CC', label: 'Chair Car (CC)' }
        ];
      case 'buses':
        return [
          { value: 'ac_seater', label: 'AC Seater' },
          { value: 'non_ac_seater', label: 'Non-AC Seater' },
          { value: 'ac_sleeper', label: 'AC Sleeper' },
          { value: 'non_ac_sleeper', label: 'Non-AC Sleeper' },
          { value: 'volvo', label: 'Volvo' },
          { value: 'luxury', label: 'Luxury' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="travel-search">
      {/* Tab Navigation */}
      <div className="search-tabs">
        <button 
          className={`tab ${activeTab === 'flights' ? 'active' : ''}`}
          onClick={() => setActiveTab('flights')}
        >
          ✈️ Flights
        </button>
        <button 
          className={`tab ${activeTab === 'trains' ? 'active' : ''}`}
          onClick={() => setActiveTab('trains')}
        >
          🚂 Trains
        </button>
        <button 
          className={`tab ${activeTab === 'buses' ? 'active' : ''}`}
          onClick={() => setActiveTab('buses')}
        >
          🚌 Buses
        </button>
      </div>

      {/* Trip Type (for flights) */}
      {activeTab === 'flights' && (
        <div className="trip-type">
          <label>
            <input
              type="radio"
              name="tripType"
              value="oneWay"
              checked={searchData.tripType === 'oneWay'}
              onChange={(e) => handleInputChange('tripType', e.target.value)}
            />
            One Way
          </label>
          <label>
            <input
              type="radio"
              name="tripType"
              value="roundTrip"
              checked={searchData.tripType === 'roundTrip'}
              onChange={(e) => handleInputChange('tripType', e.target.value)}
            />
            Round Trip
          </label>
        </div>
      )}

      {/* Search Form */}
      <div className="search-form">
        {/* Origin */}
        <div className="search-field origin-field">
          <label>From</label>
          <input
            type="text"
            placeholder="Enter origin city or airport"
            value={searchData.originDisplay || ''}
            onChange={(e) => handleInputChange('origin', e.target.value)}
            onFocus={() => setShowOriginDropdown(true)}
            onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
          />
          {showOriginDropdown && filteredOrigins.length > 0 && (
            <div className="dropdown">
              {filteredOrigins.slice(0, 5).map(dest => (
                <div 
                  key={dest._id} 
                  className="dropdown-item"
                  onClick={() => selectDestination(dest, 'origin')}
                >
                  <strong>{dest.name} ({dest.code})</strong>
                  <br />
                  <small>{dest.city}, {dest.state}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <button className="swap-btn" onClick={swapDestinations}>
          ⇄
        </button>

        {/* Destination */}
        <div className="search-field destination-field">
          <label>To</label>
          <input
            type="text"
            placeholder="Enter destination city or airport"
            value={searchData.destinationDisplay || ''}
            onChange={(e) => handleInputChange('destination', e.target.value)}
            onFocus={() => setShowDestinationDropdown(true)}
            onBlur={() => setTimeout(() => setShowDestinationDropdown(false), 200)}
          />
          {showDestinationDropdown && filteredDestinations.length > 0 && (
            <div className="dropdown">
              {filteredDestinations.slice(0, 5).map(dest => (
                <div 
                  key={dest._id} 
                  className="dropdown-item"
                  onClick={() => selectDestination(dest, 'destination')}
                >
                  <strong>{dest.name} ({dest.code})</strong>
                  <br />
                  <small>{dest.city}, {dest.state}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date Picker */}
        <div className="search-field date-field">
          <label>Departure</label>
          <input
            type="text"
            readOnly
            value={searchData.departureDate.toLocaleDateString()}
            onClick={() => setShowDatePicker(!showDatePicker)}
          />
          {showDatePicker && (
            <div className="date-picker-dropdown">
              <DateRange
                editableDateInputs={true}
                onChange={handleDateChange}
                moveRangeOnFirstSelection={false}
                ranges={dates}
                minDate={new Date()}
              />
            </div>
          )}
        </div>

        {/* Passengers */}
        <div className="search-field passenger-field">
          <label>Passengers</label>
          <div 
            className="passenger-selector"
            onClick={() => setShowPassengerPicker(!showPassengerPicker)}
          >
            {searchData.passengers} Passenger{searchData.passengers > 1 ? 's' : ''}
          </div>
          {showPassengerPicker && (
            <div className="passenger-dropdown">
              <div className="passenger-counter">
                <span>Passengers</span>
                <div className="counter-controls">
                  <button 
                    onClick={() => handlePassengerChange('dec')}
                    disabled={searchData.passengers <= 1}
                  >
                    -
                  </button>
                  <span>{searchData.passengers}</span>
                  <button 
                    onClick={() => handlePassengerChange('inc')}
                    disabled={searchData.passengers >= 9}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Class Selection */}
        <div className="search-field class-field">
          <label>Class</label>
          <select
            value={searchData.class}
            onChange={(e) => handleInputChange('class', e.target.value)}
          >
            {getClassOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button className="search-btn" onClick={handleSearch}>
          Search {activeTab}
        </button>
      </div>
    </div>
  );
};

export default TravelSearch;
