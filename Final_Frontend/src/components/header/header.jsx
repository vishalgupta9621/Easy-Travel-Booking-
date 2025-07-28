import { useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './header.css';

const Header = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [dates, setDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
    rooms: 1
  });

  const handleGuestChange = (type, operation) => {
    setGuests(prev => ({
      ...prev,
      [type]: operation === 'inc' ? prev[type] + 1 : Math.max(0, prev[type] - 1)
    }));
  };

  return (
    <div className="header">
      <div className="headerContainer">
        <div className="headerTitle">
          <h1>Find deals on hotels, homes, and much more...</h1>
          <p>From cozy country homes to funky city apartments</p>
        </div>
        <div className="headerSearch">
          {/* Destination */}
          <div className="headerSearchItem">
            <span className="headerIcon">🏨</span>
            <input
              type="text"
              placeholder="Where are you going?"
              className="headerSearchInput"
            />
          </div>

          {/* Date Picker */}
          <div className="headerSearchItem datePickerContainer">
            <span className="headerIcon">📅</span>
            <span 
              className="headerSearchText"
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowGuestPicker(false);
              }}
            >
              {`${dates[0].startDate.toLocaleDateString()} - ${dates[0].endDate.toLocaleDateString()}`}
            </span>
            {showDatePicker && (
              <div className="datePickerDropdown">
                <DateRange
                  editableDateInputs={true}
                  onChange={item => setDates([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={dates}
                  minDate={new Date()}
                  className="dateRangePicker"
                />
              </div>
            )}
          </div>

          {/* Guest Selection */}
          <div className="headerSearchItem guestPickerContainer">
            <span className="headerIcon">👪</span>
            <span 
              className="headerSearchText"
              onClick={() => {
                setShowGuestPicker(!showGuestPicker);
                setShowDatePicker(false);
              }}
            >
              {`${guests.adults} adult${guests.adults !== 1 ? 's' : ''} · 
               ${guests.children} child${guests.children !== 1 ? 'ren' : ''} · 
               ${guests.rooms} room${guests.rooms !== 1 ? 's' : ''}`}
            </span>
            {showGuestPicker && (
              <div className="guestPickerDropdown">
                <div className="guestOption">
                  <span>Adults</span>
                  <div className="guestCounter">
                    <button 
                      onClick={() => handleGuestChange('adults', 'dec')}
                      disabled={guests.adults <= 1}
                    >-</button>
                    <span>{guests.adults}</span>
                    <button onClick={() => handleGuestChange('adults', 'inc')}>+</button>
                  </div>
                </div>
                <div className="guestOption">
                  <span>Children</span>
                  <div className="guestCounter">
                    <button 
                      onClick={() => handleGuestChange('children', 'dec')}
                      disabled={guests.children <= 0}
                    >-</button>
                    <span>{guests.children}</span>
                    <button onClick={() => handleGuestChange('children', 'inc')}>+</button>
                  </div>
                </div>
                <div className="guestOption">
                  <span>Rooms</span>
                  <div className="guestCounter">
                    <button 
                      onClick={() => handleGuestChange('rooms', 'dec')}
                      disabled={guests.rooms <= 1}
                    >-</button>
                    <span>{guests.rooms}</span>
                    <button onClick={() => handleGuestChange('rooms', 'inc')}>+</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="headerSearchItem">
            <button className="headerBtn">Search Stays</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;