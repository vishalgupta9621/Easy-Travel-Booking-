import { useState, useEffect } from "react";
import "./featuredProperties.css";

const FeaturedProperties = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for featured properties
  const mockProperties = [
    {
      _id: "1",
      name: "Taj Mahal Palace",
      city: "Mumbai",
      cheapestPrice: 15000,
      rating: 4.8,
      photos: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300"]
    },
    {
      _id: "2",
      name: "The Oberoi",
      city: "New Delhi",
      cheapestPrice: 12000,
      rating: 4.7,
      photos: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300"]
    },
    {
      _id: "3",
      name: "ITC Grand Chola",
      city: "Chennai",
      cheapestPrice: 8500,
      rating: 4.6,
      photos: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300"]
    },
    {
      _id: "4",
      name: "The Leela Palace",
      city: "Bangalore",
      cheapestPrice: 9500,
      rating: 4.5,
      photos: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300"]
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/hotels?featured=true&limit=4");
        if (response.ok) {
          const apiData = await response.json();
          setData(apiData);
        } else {
          setData(mockProperties);
        }
      } catch (err) {
        console.log("Using mock data for featured properties:", err.message);
        setData(mockProperties);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="fp">
      {loading ? (
        "Loading..."
      ) : (
        <>
          {data.map((item) => (
            <div className="fpItem" key={item._id}>
              <img
                src={item.photos?.[0] || "https://cf.bstatic.com/xdata/images/hotel/square600/13125860.webp?k=e148feeb802ac3d28d1391dad9e4cf1e12d9231f897d0b53ca067bde8a9d3355&o=&s=1"}
                alt=""
                className="fpImg"
              />
              <span className="fpName">{item.name}</span>
              <span className="fpCity">{item.city}</span>
              <span className="fpPrice">Starting from ₹{item.cheapestPrice}</span>
              {item.rating && (
                <div className="fpRating">
                  <button>{item.rating}</button>
                  <span>Excellent</span>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default FeaturedProperties;
