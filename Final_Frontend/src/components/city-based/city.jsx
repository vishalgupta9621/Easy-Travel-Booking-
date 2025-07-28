import useFetch from "../../hooks/usefetch";
import { Link } from "react-router-dom";
import "./Cities.css";

const Cities = () => {
  const { data, loading, error } = useFetch("http://localhost:5000/api/hotels/cities");

  if (loading) return <div className="loading">Loading please wait...</div>;
  if (error) return <div className="error">Error loading data: {error.message}</div>;
  if (!data || data.length === 0) return <div className="no-data">No cities found.</div>;

  return (
    <div className="cities-container">
      <h1 className="cities-title">Browse by Cities</h1>
      <div className="cities-grid">
        {data.map((city) => (
          <Link 
            to={`/city/${encodeURIComponent(city._id)}`} 
            key={city._id} 
            className="city-card"
          >
            <div className="city-image-container">
              <img
                src={city.image || "https://via.placeholder.com/500x300?text=City"}
                alt={city.name}
                className="city-image"
              />
            </div>
            <div className="city-content">
              <h3 className="city-name">{city.name}</h3>
              <p className="city-count">
                {city.count} {city.count === 1 ? 'property' : 'properties'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Cities;