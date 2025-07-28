import './TravelCard.css';

const BusCard = ({ data, onBook, searchParams }) => {
  const {
    busNumber,
    operator,
    busType,
    route,
    schedule,
    seating,
    amenities,
    basePrice,
    taxes,
    pricePerPerson,
    availableSeats,
    rating,
    reviews
  } = data;

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getBusTypeIcon = (type) => {
    const icons = {
      'ac_sleeper': '🛏️',
      'non_ac_sleeper': '🛌',
      'ac_seater': '💺',
      'non_ac_seater': '🪑',
      'volvo': '🚌',
      'luxury': '✨'
    };
    return icons[type] || '🚌';
  };

  const getBusTypeName = (type) => {
    const names = {
      'ac_sleeper': 'AC Sleeper',
      'non_ac_sleeper': 'Non-AC Sleeper',
      'ac_seater': 'AC Seater',
      'non_ac_seater': 'Non-AC Seater',
      'volvo': 'Volvo',
      'luxury': 'Luxury'
    };
    return names[type] || type;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }

    return stars;
  };

  return (
    <div className="travel-card bus-card">
      <div className="card-header">
        <div className="bus-info">
          <div className="bus-icon">{getBusTypeIcon(busType)}</div>
          <div>
            <h3>{operator.name}</h3>
            <p className="bus-number">{busNumber}</p>
            <span className="bus-type">{getBusTypeName(busType)}</span>
          </div>
        </div>
        
        {rating > 0 && (
          <div className="rating">
            <div className="stars">{renderStars(rating)}</div>
            <div className="rating-text">
              {rating.toFixed(1)} ({reviews} reviews)
            </div>
          </div>
        )}
      </div>

      <div className="route-info">
        <div className="departure">
          <div className="time">{formatTime(schedule.departureTime)}</div>
          <div className="location">
            <strong>{route.origin.name}</strong>
            <div className="city">{route.origin.city}</div>
          </div>
        </div>

        <div className="bus-path">
          <div className="duration">{schedule.duration}</div>
          <div className="path-line">
            <div className="bus-route"></div>
          </div>
          <div className="stops">
            {route.stops && route.stops.length > 0 ? 
              `${route.stops.length} stops` : 'Direct'
            }
          </div>
        </div>

        <div className="arrival">
          <div className="time">{formatTime(schedule.arrivalTime)}</div>
          <div className="location">
            <strong>{route.destination.name}</strong>
            <div className="city">{route.destination.city}</div>
          </div>
        </div>
      </div>

      {route.stops && route.stops.length > 0 && (
        <div className="stops-detail">
          <strong>Stops:</strong>
          {route.stops.slice(0, 3).map((stop, index) => (
            <span key={index} className="stop">
              {stop.location.name}
              {index < Math.min(route.stops.length, 3) - 1 && ', '}
            </span>
          ))}
          {route.stops.length > 3 && ` +${route.stops.length - 3} more`}
        </div>
      )}

      <div className="bus-details">
        <div className="detail-item">
          <span className="label">Seating:</span>
          <span className="value">{seating.layout} • {seating.totalSeats} seats</span>
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
            <div>Base: ₹{basePrice?.toLocaleString()}</div>
            {taxes > 0 && (
              <div>Taxes: ₹{taxes.toLocaleString()}</div>
            )}
            <div className="per-person">per person</div>
          </div>
        </div>

        <div className="booking-actions">
          <button className="view-details-btn">
            View Seats
          </button>
          <button 
            className="book-btn"
            onClick={onBook}
            disabled={availableSeats === 0}
          >
            {availableSeats === 0 ? 'Sold Out' : 'Select Seats'}
          </button>
        </div>
      </div>

      {availableSeats <= 5 && availableSeats > 0 && (
        <div className="urgency-banner">
          Only {availableSeats} seats left!
        </div>
      )}

      {operator.rating && operator.rating >= 4.0 && (
        <div className="operator-badge">
          ⭐ Highly Rated Operator
        </div>
      )}
    </div>
  );
};

export default BusCard;
