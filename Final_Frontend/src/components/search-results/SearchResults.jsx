import { useState, useEffect } from 'react';
import axios from 'axios';
import FlightCard from './FlightCard';
import TrainCard from './TrainCard';
import BusCard from './BusCard';
import './SearchResults.css';

const SearchResults = ({ searchParams, onBooking }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('price');
  const [filters, setFilters] = useState({
    priceRange: [0, 50000],
    departureTime: 'all',
    duration: 'all',
    stops: 'all'
  });

  useEffect(() => {
    if (searchParams) {
      searchTravelOptions();
    }
  }, [searchParams]);

  const searchTravelOptions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { travelType, origin, destination, departureDate, passengers, class: travelClass } = searchParams;
      
      let endpoint = '';
      let params = {
        origin,
        destination,
        departureDate: departureDate.toISOString().split('T')[0],
        passengers
      };

      switch (travelType) {
        case 'flight':
          endpoint = '/api/flights/search';
          params.class = travelClass;
          break;
        case 'train':
          endpoint = '/api/trains/search';
          params.class = travelClass;
          break;
        case 'bus':
          endpoint = '/api/buses/search';
          if (travelClass !== 'economy') {
            params.busType = travelClass;
          }
          break;
        default:
          throw new Error('Invalid travel type');
      }

      const response = await axios.get(endpoint, { params });
      setResults(response.data[`${travelType}s`] || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search travel options');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (criteria) => {
    setSortBy(criteria);
    const sorted = [...results].sort((a, b) => {
      switch (criteria) {
        case 'price':
          return (a.pricePerPerson || a.basePrice) - (b.pricePerPerson || b.basePrice);
        case 'duration':
          return a.schedule.duration - b.schedule.duration;
        case 'departure':
          return a.schedule.departureTime.localeCompare(b.schedule.departureTime);
        case 'arrival':
          return a.schedule.arrivalTime.localeCompare(b.schedule.arrivalTime);
        default:
          return 0;
      }
    });
    setResults(sorted);
  };

  const applyFilters = (filteredResults) => {
    return filteredResults.filter(item => {
      const price = item.pricePerPerson || item.basePrice || 0;
      
      // Price filter
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      // Departure time filter
      if (filters.departureTime !== 'all') {
        const depTime = parseInt(item.schedule.departureTime.split(':')[0]);
        switch (filters.departureTime) {
          case 'morning':
            if (depTime < 6 || depTime >= 12) return false;
            break;
          case 'afternoon':
            if (depTime < 12 || depTime >= 18) return false;
            break;
          case 'evening':
            if (depTime < 18 || depTime >= 24) return false;
            break;
          case 'night':
            if (depTime >= 6 && depTime < 18) return false;
            break;
        }
      }

      return true;
    });
  };

  const renderTravelCard = (item, index) => {
    const commonProps = {
      key: item._id || index,
      data: item,
      onBook: () => onBooking(item),
      searchParams
    };

    switch (searchParams.travelType) {
      case 'flight':
        return <FlightCard {...commonProps} />;
      case 'train':
        return <TrainCard {...commonProps} />;
      case 'bus':
        return <BusCard {...commonProps} />;
      default:
        return null;
    }
  };

  const filteredResults = applyFilters(results);

  if (loading) {
    return (
      <div className="search-results loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Searching for the best {searchParams?.travelType}s...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results error">
        <div className="error-message">
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button onClick={searchTravelOptions} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!searchParams) {
    return (
      <div className="search-results empty">
        <div className="empty-state">
          <h3>Ready to explore?</h3>
          <p>Use the search form above to find flights, trains, or buses for your journey.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results">
      {/* Search Summary */}
      <div className="search-summary">
        <h2>
          {searchParams.travelType === 'flight' ? '✈️' : 
           searchParams.travelType === 'train' ? '🚂' : '🚌'} 
          {filteredResults.length} {searchParams.travelType}s found
        </h2>
        <p>
          {searchParams.originDisplay} → {searchParams.destinationDisplay} • 
          {searchParams.departureDate.toLocaleDateString()} • 
          {searchParams.passengers} passenger{searchParams.passengers > 1 ? 's' : ''}
        </p>
      </div>

      {filteredResults.length > 0 && (
        <>
          {/* Filters and Sort */}
          <div className="controls">
            <div className="sort-controls">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => handleSort(e.target.value)}>
                <option value="price">Price (Low to High)</option>
                <option value="duration">Duration</option>
                <option value="departure">Departure Time</option>
                <option value="arrival">Arrival Time</option>
              </select>
            </div>

            <div className="filter-controls">
              <div className="filter-group">
                <label>Departure Time:</label>
                <select 
                  value={filters.departureTime} 
                  onChange={(e) => setFilters(prev => ({...prev, departureTime: e.target.value}))}
                >
                  <option value="all">All Times</option>
                  <option value="morning">Morning (6AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 6PM)</option>
                  <option value="evening">Evening (6PM - 12AM)</option>
                  <option value="night">Night (12AM - 6AM)</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Price Range:</label>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="500"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev, 
                    priceRange: [0, parseInt(e.target.value)]
                  }))}
                />
                <span>Up to ₹{filters.priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="results-list">
            {filteredResults.map(renderTravelCard)}
          </div>
        </>
      )}

      {filteredResults.length === 0 && results.length > 0 && (
        <div className="no-results">
          <h3>No results match your filters</h3>
          <p>Try adjusting your filters to see more options.</p>
          <button 
            onClick={() => setFilters({
              priceRange: [0, 50000],
              departureTime: 'all',
              duration: 'all',
              stops: 'all'
            })}
            className="clear-filters-btn"
          >
            Clear Filters
          </button>
        </div>
      )}

      {results.length === 0 && !loading && (
        <div className="no-results">
          <h3>No {searchParams.travelType}s found</h3>
          <p>Try different dates or destinations for more options.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
