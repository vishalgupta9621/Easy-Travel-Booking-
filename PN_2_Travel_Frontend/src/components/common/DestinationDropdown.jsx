
import { useState, useEffect } from 'react';
import { destinationService } from '../../services/api.service';
import './DestinationDropdown.css';

const DestinationDropdown = ({ 
  type, 
  value, 
  onChange, 
  placeholder = "Select destination",
  name,
  required = false 
}) => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState([]);

  useEffect(() => {
    loadDestinations();
  }, [type]);

  useEffect(() => {
    // Filter destinations based on search term
    if (searchTerm) {
      const filtered = destinations.filter(dest => 
        dest.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDestinations(filtered);
    } else {
      setFilteredDestinations(destinations);
    }
  }, [destinations, searchTerm]);

  const loadDestinations = async () => {
    setLoading(true);
    try {
      const data = await destinationService.getByType(type);
      setDestinations(data);
      setFilteredDestinations(data);
    } catch (error) {
      console.error('Error loading destinations:', error);
      setDestinations([]);
      setFilteredDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (destination, event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Selected destination:', destination);

    // Pass both the ID and the full destination object
    onChange(destination._id, destination);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getDisplayValue = () => {
    if (value) {
      // First check if we have the destination in our loaded destinations
      const selected = destinations.find(dest => dest._id === value);
      if (selected) {
        return `${selected.city} - ${selected.name}`;
      }
      
      // If value is a string that looks like a display format, use it
      if (typeof value === 'string' && value.includes(' - ')) {
        return value;
      }
      
      // If we have a MongoDB ObjectId but haven't found it in destinations yet
      if (typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/)) {
        return ''; // Return empty until destinations are loaded
      }
      
      // Fallback - return the value as is
      return value;
    }
    return '';
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);
    
    // If user clears the input, also clear the selected value
    if (inputValue === '') {
      onChange('', null);
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    // Clear search term when opening dropdown to show all options
    setSearchTerm('');
  };

  const handleBlur = () => {
    // Delay closing to allow for click events on dropdown items
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  return (
    <div className="destination-dropdown">
      <div className="dropdown-container">
        <input
          type="text"
          className="dropdown-input"
          placeholder={placeholder}
          value={isOpen ? searchTerm : getDisplayValue()}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          name={name}
          autoComplete="off"
        />
        
        {isOpen && (
          <div className="dropdown-menu">
            {loading ? (
              <div className="dropdown-item loading">Loading destinations...</div>
            ) : filteredDestinations.length > 0 ? (
              filteredDestinations.map((destination) => (
                <div
                  key={destination._id}
                  className={`dropdown-item ${value === destination._id ? 'selected' : ''}`}
                  onMouseDown={(e) => handleSelect(destination, e)}
                >
                  <div className="destination-info">
                    <span className="city">{destination.city}</span>
                    <span className="separator"> - </span>
                    <span className="name">{destination.name}</span>
                    {destination.code && (
                      <span className="code"> ({destination.code})</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="dropdown-item no-results">
                {searchTerm ? `No destinations found for "${searchTerm}"` : 'No destinations found'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationDropdown;