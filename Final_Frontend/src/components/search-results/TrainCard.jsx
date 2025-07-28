import './TravelCard.css';

const TrainCard = ({ data, onBook, searchParams }) => {
  const {
    trainNumber,
    trainName,
    trainType,
    route,
    schedule,
    availableClasses,
    pantryAvailable,
    wifiAvailable
  } = data;

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTrainTypeIcon = (type) => {
    const icons = {
      'express': '🚄',
      'superfast': '🚅',
      'rajdhani': '🚆',
      'shatabdi': '🚈',
      'duronto': '🚇',
      'passenger': '🚂',
      'local': '🚃'
    };
    return icons[type] || '🚂';
  };

  const selectedClass = searchParams.class;
  const selectedClassInfo = availableClasses?.find(cls => cls.code === selectedClass) || availableClasses?.[0];

  return (
    <div className="travel-card train-card">
      <div className="card-header">
        <div className="train-info">
          <div className="train-icon">{getTrainTypeIcon(trainType)}</div>
          <div>
            <h3>{trainName}</h3>
            <p className="train-number">{trainNumber}</p>
            <span className="train-type">{trainType.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="route-info">
        <div className="departure">
          <div className="time">{formatTime(schedule.departureTime)}</div>
          <div className="location">
            <strong>{route.origin.code}</strong>
            <div className="city">{route.origin.city}</div>
          </div>
        </div>

        <div className="train-path">
          <div className="duration">{schedule.duration}</div>
          <div className="path-line">
            <div className="train-track"></div>
          </div>
          <div className="distance">
            {route.stations && route.stations.length > 0 && (
              <span>{route.stations.length} stations</span>
            )}
          </div>
        </div>

        <div className="arrival">
          <div className="time">{formatTime(schedule.arrivalTime)}</div>
          <div className="location">
            <strong>{route.destination.code}</strong>
            <div className="city">{route.destination.city}</div>
          </div>
        </div>
      </div>

      {route.stations && route.stations.length > 0 && (
        <div className="stations-detail">
          <strong>Major Stations:</strong>
          {route.stations.slice(0, 4).map((station, index) => (
            <span key={index} className="station">
              {station.station.code}
              {index < Math.min(route.stations.length, 4) - 1 && ', '}
            </span>
          ))}
          {route.stations.length > 4 && ` +${route.stations.length - 4} more`}
        </div>
      )}

      <div className="train-features">
        {pantryAvailable && (
          <div className="feature">
            <span className="feature-icon">🍽️</span>
            <span>Pantry Available</span>
          </div>
        )}
        {wifiAvailable && (
          <div className="feature">
            <span className="feature-icon">📶</span>
            <span>WiFi Available</span>
          </div>
        )}
      </div>

      {availableClasses && availableClasses.length > 0 && (
        <div className="available-classes">
          <h4>Available Classes:</h4>
          <div className="classes-grid">
            {availableClasses.map((cls, index) => (
              <div 
                key={index} 
                className={`class-option ${cls.code === selectedClass ? 'selected' : ''}`}
              >
                <div className="class-name">{cls.name} ({cls.code})</div>
                <div className="class-price">₹{cls.pricePerPerson?.toLocaleString()}</div>
                <div className="class-seats">{cls.availableSeats} seats</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-footer">
        <div className="pricing">
          {selectedClassInfo && (
            <>
              <div className="price">
                <span className="currency">₹</span>
                <span className="amount">{selectedClassInfo.pricePerPerson?.toLocaleString()}</span>
              </div>
              <div className="price-details">
                <div className="class-selected">{selectedClassInfo.name}</div>
                <div className="per-person">per person</div>
                <div className="available-seats">
                  {selectedClassInfo.availableSeats} seats available
                </div>
              </div>
            </>
          )}
        </div>

        <div className="booking-actions">
          <button className="view-details-btn">
            View Details
          </button>
          <button 
            className="book-btn"
            onClick={onBook}
            disabled={!selectedClassInfo || selectedClassInfo.availableSeats === 0}
          >
            {!selectedClassInfo || selectedClassInfo.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
          </button>
        </div>
      </div>

      {selectedClassInfo && selectedClassInfo.availableSeats <= 10 && selectedClassInfo.availableSeats > 0 && (
        <div className="urgency-banner">
          Only {selectedClassInfo.availableSeats} seats left in {selectedClassInfo.name}!
        </div>
      )}
    </div>
  );
};

export default TrainCard;
