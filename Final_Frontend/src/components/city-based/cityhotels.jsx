import { useParams, Link } from "react-router-dom"; // Added Link import
import useFetch from "../../hooks/usefetch";
import Navbar from "../navbar/Navbar";
import "../featured/Featured.css";

const CityHotels = () => {
  const { cityId } = useParams();
  const decodedCityId = decodeURIComponent(cityId);
  const { data, loading, error } = useFetch(
    `http://localhost:5000/api/hotels/city/${encodeURIComponent(decodedCityId)}`
  );

  if (loading) return <div className="loading">Loading please wait...</div>;
  if (error)
    return <div className="error">Error loading data: {error.message}</div>;
  if (!data || data.length === 0)
    return (
      <div className="no-data">
        No hotels found in {decodedCityId}.
        <br />
        <Link to="/cities" className="back-link">
          ← Back to Cities
        </Link>
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="featured-container">
        <h1 className="featured-title">Hotels in {decodedCityId}</h1>
        <div className="featured-grid">
          {data.map((hotel) => (
            <div className="hotel-card" key={hotel._id}>
              <div className="card-image-container">
                <img
                  src={
                    hotel.photos && hotel.photos[0]
                      ? hotel.photos[0]
                      : "https://via.placeholder.com/500x300?text=No+Image"
                  }
                  alt={hotel.name}
                  className="card-image"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/500x300?text=No+Image";
                  }}
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
                  <span className="location-icon">📍</span> {hotel.city},{" "}
                  {hotel.address}
                </p>
                <p className="card-description">
                  {hotel.desc?.substring(0, 100) || "No description available"}
                  ...
                </p>
                <div className="card-details">
                  <span className="card-type">{hotel.type}</span>
                  <span className="card-distance">
                    {hotel.distance} from center
                  </span>
                </div>
                <div className="card-footer">
                  <span className="card-price">
                    {hotel.cheapestPrice?.toLocaleString() || "N/A"} USD
                  </span>
                  <span className="price-unit">/ night</span>
                  <Link
                    to={`/hotels/${hotel._id}/book`}
                    className="view-button"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="back-to-cities">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default CityHotels;
