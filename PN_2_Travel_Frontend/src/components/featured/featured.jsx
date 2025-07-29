import { useEffect, useState, useCallback } from "react";
import useFetch from "../../hooks/usefetch";
import { API_URL } from "../../config";
import "./featured.css";

const Featured = () => {
  const [page, setPage] = useState(1);
  const { data, loading, error, hasMore } = useFetch(`${API_URL}/hotels/paginated`, page);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
      if (!loading && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }
  }, [loading, hasMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (error) return <div className="error">Error loading data: {error.message}</div>;
  if (!data || data.length === 0) return <div className="no-data">No hotels found.</div>;

  return (
    <div className="featured-container">
      <h1 className="featured-title">Featured Stays</h1>
      <div className="featured-grid">
        {data.map((hotel) => (
          <div className="hotel-card" key={hotel._id}>
            <div className="card-image-container">
              <img
                src={hotel.photos && hotel.photos[0] ? hotel.photos[0].url : "https://via.placeholder.com/500x300?text=No+Image"}
                alt={hotel.name}
                className="card-image"
              />
              {hotel.rating && (
                <div className="rating-badge">
                  {hotel.rating.toFixed(1)} ★
                </div>
              )}
            </div>
            <div className="card-content">
              <h3 className="card-title">{hotel.name}</h3>
              <p className="card-location">
                <span className="location-icon">📍</span> {hotel.city}, {hotel.address}
              </p>
              <p className="card-description">{hotel.desc.substring(0, 100)}...</p>
              <div className="card-details">
                <span className="card-type">{hotel.type}</span>
                <span className="card-distance">{hotel.distance} from center</span>
              </div>
              <div className="card-footer">
                <span className="card-price">₹{hotel.cheapestPrice}</span>
                <span className="price-unit">/ night</span>
                <button className="view-button">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {loading && <div className="loading">Loading more hotels...</div>}
    </div>
  );
};

export default Featured;