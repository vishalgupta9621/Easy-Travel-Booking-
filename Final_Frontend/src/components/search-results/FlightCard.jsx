import './TravelCard.css';

const FlightCard = ({ data, onBook, searchParams }) => {
  const {
    flightNumber,
    airline,
    route,
    schedule,
    pricing,
    amenities,
    baggage,
    pricePerPerson,
    availableSeats
  } = data;

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStopsText = () => {
    if (!route.stops || route.stops.length === 0) {
      return 'Non-stop';
    }
    return `${route.stops.length} stop${route.stops.length > 1 ? 's' : ''}`;
  };

  const selectedClass = searchParams.class || 'economy';
  const classInfo = pricing[selectedClass];

  return (
    <div className="travel-card flight-card">
      <div className="card-header">
        <div className="airline-info">
          {airline.logo && (
            <img src={airline.logo} alt={airline.name} className="airline-logo" />
          )}
          <div>
            <h3>{airline.name}</h3>
            <p className="flight-number">{flightNumber}</p>
          </div>
        </div>
        <div className="class-badge">
          {selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1)}
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

        <div className="flight-path">
          <div className="duration">{formatDuration(schedule.duration)}</div>
          <div className="path-line">
            <div className="plane-icon">✈️</div>
          </div>
          <div className="stops">{getStopsText()}</div>
        </div>

        <div className="arrival">
          <div className="time">{formatTime(schedule.arrivalTime)}</div>
          <div className="location">
            <strong>{route.destination.code}</strong>
            <div className="city">{route.destination.city}</div>
          </div>
        </div>
      </div>

      {route.stops && route.stops.length > 0 && (
        <div className="stops-detail">
          <strong>Stops:</strong>
          {route.stops.map((stop, index) => (
            <span key={index} className="stop">
              {stop.destination.code}
              {index < route.stops.length - 1 && ', '}
            </span>
          ))}
        </div>
      )}

      <div className="flight-details">
        <div className="detail-item">
          <span className="label">Baggage:</span>
          <span className="value">
            {baggage.cabin} cabin, {baggage.checkedIn} check-in
          </span>
        </div>
        
        {amenities && amenities.length > 0 && (
          <div className="detail-item">
            <span className="label">Amenities:</span>
            <span className="value">
              {amenities.slice(0, 3).map(amenity => amenity.name).join(', ')}
              {amenities.length > 3 && ` +${amenities.length - 3} more`}
            </span>
          </div>
        )}

        <div className="detail-item">
          <span className="label">Available Seats:</span>
          <span className="value">{availableSeats}</span>
        </div>
      </div>

      <div className="card-footer">
        <div className="pricing">
          <div className="price">
            <span className="currency">₹</span>
            <span className="amount">{pricePerPerson?.toLocaleString()}</span>
          </div>
          <div className="price-details">
            <div>Base: ₹{classInfo?.basePrice?.toLocaleString()}</div>
            {classInfo?.taxes > 0 && (
              <div>Taxes: ₹{classInfo.taxes.toLocaleString()}</div>
            )}
            <div className="per-person">per person</div>
          </div>
        </div>

        <div className="booking-actions">
          <button className="view-details-btn">
            View Details
          </button>
          <button 
            className="book-btn"
            onClick={onBook}
            disabled={availableSeats === 0}
          >
            {availableSeats === 0 ? 'Sold Out' : 'Book Now'}
          </button>
        </div>
      </div>

      {availableSeats <= 5 && availableSeats > 0 && (
        <div className="urgency-banner">
          Only {availableSeats} seats left!
        </div>
      )}
    </div>
  );
};

export default FlightCard;
