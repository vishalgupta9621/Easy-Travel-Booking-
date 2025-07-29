import "./new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  userService,
  busService,
  flightService,
  trainService,
  hotelService,
  packageService
} from "../../services/api.service";

const New = ({ inputs, title }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const [file, setFile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Determine page type
  const pageType = pathname.includes("/users") ? "users" :
                   pathname.includes("/hotels") ? "hotels" :
                   pathname.includes("/buses") ? "buses" :
                   pathname.includes("/flights") ? "flights" :
                   pathname.includes("/trains") ? "trains" :
                   pathname.includes("/packages") ? "packages" : "other";

  // Determine page type and initial form data
  const getInitialFormData = () => {
    if (pathname.includes("/users")) {
      return {
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        age: "",
        birthDate: "",
        address: "",
        city: "",
        state: "",
        country: "",
        status: "active",
        is_verified: false,
        documents: []
      };
    } else if (pathname.includes("/hotels")) {
      return {
        name: "",
        type: "",
        city: "",
        address: "",
        distance: "",
        title: "",
        desc: "",
        rating: "",
        cheapestPrice: "",
        featured: false,
        rooms: []
      };
    } else if (pathname.includes("/buses")) {
      return {
        busNumber: "",
        operator: { name: "", code: "" },
        busType: "ac_seater",
        seating: { totalSeats: "", seatConfiguration: [] },
        route: { origin: "", destination: "" },
        schedule: { departureTime: "", arrivalTime: "", duration: "", validFrom: "", validTo: "" },
        basePrice: "",
        status: "active"
      };
    } else if (pathname.includes("/flights")) {
      return {
        flightNumber: "",
        airline: { name: "", code: "" },
        aircraft: { model: "", capacity: "" },
        route: { origin: "", destination: "" },
        schedule: { departureTime: "", arrivalTime: "", duration: "", validFrom: "", validTo: "" },
        pricing: {
          economy: { basePrice: "", totalSeats: "" },
          business: { basePrice: "", totalSeats: "" }
        },
        status: "active"
      };
    } else if (pathname.includes("/trains")) {
      return {
        trainNumber: "",
        trainName: "",
        trainType: "express",
        route: { origin: "", destination: "" },
        schedule: { departureTime: "", arrivalTime: "", duration: "", validFrom: "", validTo: "" },
        classes: [],
        pantryAvailable: false,
        wifiAvailable: false,
        status: "active"
      };
    } else if (pathname.includes("/packages")) {
      return {
        name: "",
        description: "",
        duration: "",
        destinations: "",
        type: "leisure",
        basePrice: "",
        pricing: {
          basePackagePrice: "",
          hotelOptions: {
            budget: { pricePerNight: "" },
            standard: { pricePerNight: "" },
            luxury: { pricePerNight: "" }
          },
          transportOptions: {
            flight: { basePrice: "" },
            train: { basePrice: "" },
            bus: { basePrice: "" }
          }
        },
        inclusions: "",
        exclusions: "",
        rating: "",
        maxGroupSize: "",
        minAge: "",
        difficulty: "easy",
        availableSlots: "",
        isActive: true
      };
    }
    return {};
  };

  const [formData, setFormData] = useState(getInitialFormData());

  // Helper function to get nested values
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    // Handle nested object properties (e.g., "operator.name")
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;

        // Navigate to the nested object
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }

        // Set the final value
        current[keys[keys.length - 1]] = inputValue;
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: inputValue
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (pathname.includes("/users")) {
        const userData = {
          ...formData,
          email: formData.email || null,
          phone: formData.phone || null,
          age: formData.age ? parseInt(formData.age) : null,
          birthDate: formData.birthDate || null,
          firstName: formData.firstName || "",
          lastName: formData.lastName || "",
          address: formData.address || "",
          city: formData.city || "",
          state: formData.state || "",
          country: formData.country || "",
          documents: []
        };
        await userService.create(userData);
        navigate("/users");
      } else if (pathname.includes("/hotels")) {
        const hotelData = {
          ...formData,
          photos: [{
            url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60",
            index: 0,
            label: "Default hotel image"
          }],
          rooms: formData.rooms ? formData.rooms.split(',').map(room => room.trim()) : []
        };
        await hotelService.create(hotelData);
        navigate("/hotels");
      } else if (pathname.includes("/buses")) {
        await busService.create(formData);
        navigate("/buses");
      } else if (pathname.includes("/flights")) {
        await flightService.create(formData);
        navigate("/flights");
      } else if (pathname.includes("/trains")) {
        await trainService.create(formData);
        navigate("/trains");
      } else if (pathname.includes("/packages")) {
        // Process package data before sending
        const packageData = {
          ...formData,
          destinations: formData.destinations ? formData.destinations.split(',').map(d => d.trim()) : [],
          inclusions: formData.inclusions ? formData.inclusions.split(',').map(i => i.trim()) : [],
          exclusions: formData.exclusions ? formData.exclusions.split(',').map(e => e.trim()) : [],
          duration: formData.duration ? parseInt(formData.duration) : 0,
          basePrice: formData.basePrice ? parseFloat(formData.basePrice) : 0,
          rating: formData.rating ? parseFloat(formData.rating) : 0,
          maxGroupSize: formData.maxGroupSize ? parseInt(formData.maxGroupSize) : 10,
          minAge: formData.minAge ? parseInt(formData.minAge) : 0,
          availableSlots: formData.availableSlots ? parseInt(formData.availableSlots) : 20,
          price: formData.basePrice ? parseFloat(formData.basePrice) : 0 // For backward compatibility
        };
        await packageService.create(packageData);
        navigate("/packages");
      }
    } catch (error) {
      console.error("Error creating:", error);
      setError(error.response?.data?.message || "Error creating item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt=""
            />
          </div>
          <div className="right">
            <form onSubmit={handleSubmit}>
              {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}

              {/* User Form */}
              {pageType === "users" && (
                <>
                  <div className="formInput">
                    <label>Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter username"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="formInput">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                    />
                  </div>

                  <div className="formInput">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email"
                      pattern="^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$"
                    />
                  </div>

                  <div className="formInput">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number (10-15 digits)"
                      pattern="[0-9]{10,15}"
                    />
                  </div>

                  <div className="formInput">
                    <label>Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Enter age"
                      min="0"
                    />
                  </div>

                  <div className="formInput">
                    <label>Birth Date</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="formInput">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address"
                    />
                  </div>

                  <div className="formInput">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="formInput">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Enter state"
                    />
                  </div>

                  <div className="formInput">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Enter country"
                    />
                  </div>

                  <div className="formInput">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>

                  <div className="formInput">
                    <label>Verified</label>
                    <input
                      type="checkbox"
                      name="is_verified"
                      checked={formData.is_verified}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              {pageType === "hotels" && (
                <>
                  <div className="formInput">
                    <label htmlFor="file">
                      Image: <DriveFolderUploadOutlinedIcon className="icon" />
                    </label>
                    <input
                      type="file"
                      id="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className="formInput">
                    <label>Hotel Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter hotel name"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Type</label>
                    <input
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      placeholder="e.g., Resort, Hotel, Motel"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Distance</label>
                    <input
                      type="text"
                      name="distance"
                      value={formData.distance}
                      onChange={handleInputChange}
                      placeholder="e.g., 500m from beach"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter hotel title"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Description</label>
                    <textarea
                      name="desc"
                      value={formData.desc}
                      onChange={handleInputChange}
                      placeholder="Enter hotel description"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Rating</label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      placeholder="Enter rating (0-5)"
                      min="0"
                      max="5"
                      step="0.1"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Cheapest Price (₹)</label>
                    <input
                      type="number"
                      name="cheapestPrice"
                      value={formData.cheapestPrice}
                      onChange={handleInputChange}
                      placeholder="Enter price"
                      min="0"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Room Numbers (comma-separated)</label>
                    <input
                      type="text"
                      name="rooms"
                      value={formData.rooms}
                      onChange={handleInputChange}
                      placeholder="e.g., 101, 102, 201, 202"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Featured</label>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              {pageType === "packages" && (
                <>
                  <div className="formInput">
                    <label>Package Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter package name"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter package description"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Duration (Days) *</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="Enter duration in days"
                      min="1"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Destinations (comma separated)</label>
                    <input
                      type="text"
                      name="destinations"
                      value={formData.destinations}
                      onChange={handleInputChange}
                      placeholder="e.g., Delhi, Agra, Jaipur"
                    />
                  </div>

                  <div className="formInput">
                    <label>Package Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                    >
                      <option value="adventure">Adventure</option>
                      <option value="leisure">Leisure</option>
                      <option value="business">Business</option>
                      <option value="family">Family</option>
                      <option value="honeymoon">Honeymoon</option>
                      <option value="pilgrimage">Pilgrimage</option>
                    </select>
                  </div>

                  <div className="formInput">
                    <label>Base Price (₹) *</label>
                    <input
                      type="number"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleInputChange}
                      placeholder="Enter base price"
                      min="0"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Base Package Price (₹)</label>
                    <input
                      type="number"
                      name="pricing.basePackagePrice"
                      value={getNestedValue(formData, "pricing.basePackagePrice")}
                      onChange={handleInputChange}
                      placeholder="Enter base package price"
                      min="0"
                    />
                  </div>

                  <div className="formInput">
                    <label>Budget Hotel Price/Night (₹)</label>
                    <input
                      type="number"
                      name="pricing.hotelOptions.budget.pricePerNight"
                      value={getNestedValue(formData, "pricing.hotelOptions.budget.pricePerNight")}
                      onChange={handleInputChange}
                      placeholder="Enter budget hotel price"
                      min="0"
                    />
                  </div>

                  <div className="formInput">
                    <label>Standard Hotel Price/Night (₹)</label>
                    <input
                      type="number"
                      name="pricing.hotelOptions.standard.pricePerNight"
                      value={getNestedValue(formData, "pricing.hotelOptions.standard.pricePerNight")}
                      onChange={handleInputChange}
                      placeholder="Enter standard hotel price"
                      min="0"
                    />
                  </div>

                  <div className="formInput">
                    <label>Luxury Hotel Price/Night (₹)</label>
                    <input
                      type="number"
                      name="pricing.hotelOptions.luxury.pricePerNight"
                      value={getNestedValue(formData, "pricing.hotelOptions.luxury.pricePerNight")}
                      onChange={handleInputChange}
                      placeholder="Enter luxury hotel price"
                      min="0"
                    />
                  </div>

                  <div className="formInput">
                    <label>Flight Price (₹)</label>
                    <input
                      type="number"
                      name="pricing.transportOptions.flight.basePrice"
                      value={getNestedValue(formData, "pricing.transportOptions.flight.basePrice")}
                      onChange={handleInputChange}
                      placeholder="Enter flight price"
                      min="0"
                    />
                  </div>

                  <div className="formInput">
                    <label>Train Price (₹)</label>
                    <input
                      type="number"
                      name="pricing.transportOptions.train.basePrice"
                      value={getNestedValue(formData, "pricing.transportOptions.train.basePrice")}
                      onChange={handleInputChange}
                      placeholder="Enter train price"
                      min="0"
                    />
                  </div>

                  <div className="formInput">
                    <label>Bus Price (₹)</label>
                    <input
                      type="number"
                      name="pricing.transportOptions.bus.basePrice"
                      value={getNestedValue(formData, "pricing.transportOptions.bus.basePrice")}
                      onChange={handleInputChange}
                      placeholder="Enter bus price"
                      min="0"
                    />
                  </div>

                  <div className="formInput">
                    <label>Inclusions (comma separated)</label>
                    <textarea
                      name="inclusions"
                      value={formData.inclusions}
                      onChange={handleInputChange}
                      placeholder="e.g., Accommodation, Transportation, Breakfast"
                    />
                  </div>

                  <div className="formInput">
                    <label>Exclusions (comma separated)</label>
                    <textarea
                      name="exclusions"
                      value={formData.exclusions}
                      onChange={handleInputChange}
                      placeholder="e.g., Lunch and dinner, Personal expenses"
                    />
                  </div>

                  <div className="formInput">
                    <label>Rating</label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      placeholder="Enter rating (0-5)"
                      min="0"
                      max="5"
                      step="0.1"
                    />
                  </div>

                  <div className="formInput">
                    <label>Max Group Size</label>
                    <input
                      type="number"
                      name="maxGroupSize"
                      value={formData.maxGroupSize}
                      onChange={handleInputChange}
                      placeholder="Enter max group size"
                      min="1"
                    />
                  </div>

                  <div className="formInput">
                    <label>Minimum Age</label>
                    <input
                      type="number"
                      name="minAge"
                      value={formData.minAge}
                      onChange={handleInputChange}
                      placeholder="Enter minimum age"
                      min="0"
                    />
                  </div>

                  <div className="formInput">
                    <label>Difficulty</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                    >
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="difficult">Difficult</option>
                    </select>
                  </div>

                  <div className="formInput">
                    <label>Available Slots</label>
                    <input
                      type="number"
                      name="availableSlots"
                      value={formData.availableSlots}
                      onChange={handleInputChange}
                      placeholder="Enter available slots"
                      min="0"
                    />
                  </div>

                  <div className="formInput">
                    <label>Active</label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              {(pageType === "buses" || pageType === "flights" || pageType === "trains") && (
                // Dynamic form rendering for other models (buses, flights, trains)
                <React.Fragment>
                  {inputs && inputs.map((input) => (
                    <div className="formInput" key={input.id}>
                      <label>{input.label}</label>
                      {input.type === 'select' ? (
                        <select
                          name={input.name}
                          value={getNestedValue(formData, input.name) || ''}
                          onChange={handleInputChange}
                          required={input.required}
                        >
                          <option value="">Select {input.label}</option>
                          {input.options?.map((option) => (
                            <option key={option} value={option}>
                              {option.replace('_', ' ').toUpperCase()}
                            </option>
                          ))}
                        </select>
                      ) : input.type === 'textarea' ? (
                        <textarea
                          name={input.name}
                          value={getNestedValue(formData, input.name) || ''}
                          onChange={handleInputChange}
                          placeholder={input.placeholder}
                          required={input.required}
                        />
                      ) : input.type === 'checkbox' ? (
                        <input
                          type="checkbox"
                          name={input.name}
                          checked={getNestedValue(formData, input.name) || false}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <input
                          type={input.type}
                          name={input.name}
                          value={getNestedValue(formData, input.name) || ''}
                          onChange={handleInputChange}
                          placeholder={input.placeholder}
                          min={input.min}
                          max={input.max}
                          step={input.step}
                          required={input.required}
                        />
                      )}
                    </div>
                  ))}
                </React.Fragment>
              )}

              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' :
                  pageType === "packages" ? 'Create Package' :
                  pageType === "users" ? 'Create User' :
                  pageType === "hotels" ? 'Create Hotel' :
                  pageType === "buses" ? 'Create Bus' :
                  pageType === "flights" ? 'Create Flight' :
                  pageType === "trains" ? 'Create Train' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;
