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
        email: "",
        phone: "",
        rating: 0,
        cheapestPrice: 0,
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
        basePrice: 0,
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
          economy: { basePrice: 0, totalSeats: "" },
          business: { basePrice: 0, totalSeats: "" }
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
        duration: 0,
        destinations: "",
        type: "leisure",
        basePrice: 0,
        pricing: {
          basePackagePrice: 0,
          hotelOptions: {
            budget: { pricePerNight: 0 },
            standard: { pricePerNight: 0 },
            luxury: { pricePerNight: 0 }
          },
          transportOptions: {
            flight: { basePrice: 0 },
            train: { basePrice: 0 },
            bus: { basePrice: 0 }
          }
        },
        inclusions: "",
        exclusions: "",
        rating: 0,
        maxGroupSize: 0,
        minAge: 0,
        difficulty: "easy",
        availableSlots: 0,
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
    let inputValue;

    if (type === 'checkbox') {
      inputValue = checked;
    } else if (type === 'number') {
      inputValue = value === '' ? '' : parseFloat(value);
    } else {
      inputValue = value;
    }

    // Handle nested object properties
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }

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
            url: file ? URL.createObjectURL(file) : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60",
            index: 0,
            label: "Hotel image"
          }],
          rooms: formData.rooms ? formData.rooms.split(',').map(room => room.trim()) : [],
          email: formData.email || null,
          phone: formData.phone || null,
          rating: parseFloat(formData.rating) || 0,
          cheapestPrice: parseFloat(formData.cheapestPrice) || 0
        };
        
        await hotelService.create(hotelData);
        navigate("/hotels");
      } else if (pathname.includes("/buses")) {
        const busData = {
          ...formData,
          basePrice: parseFloat(formData.basePrice) || 0,
          seating: {
            ...formData.seating,
            totalSeats: parseInt(formData.seating.totalSeats) || 0
          }
        };
        await busService.create(busData);
        navigate("/buses");
      } else if (pathname.includes("/flights")) {
        const flightData = {
          ...formData,
          pricing: {
            economy: {
              basePrice: parseFloat(formData.pricing.economy.basePrice) || 0,
              totalSeats: parseInt(formData.pricing.economy.totalSeats) || 0
            },
            business: {
              basePrice: parseFloat(formData.pricing.business.basePrice) || 0,
              totalSeats: parseInt(formData.pricing.business.totalSeats) || 0
            }
          }
        };
        await flightService.create(flightData);
        navigate("/flights");
      } else if (pathname.includes("/trains")) {
        await trainService.create(formData);
        navigate("/trains");
      } else if (pathname.includes("/packages")) {
        const packageData = {
          ...formData,
          destinations: formData.destinations ? formData.destinations.split(',').map(d => d.trim()) : [],
          inclusions: formData.inclusions ? formData.inclusions.split(',').map(i => i.trim()) : [],
          exclusions: formData.exclusions ? formData.exclusions.split(',').map(e => e.trim()) : [],
          duration: parseInt(formData.duration) || 0,
          basePrice: parseFloat(formData.basePrice) || 0,
          rating: parseFloat(formData.rating) || 0,
          maxGroupSize: parseInt(formData.maxGroupSize) || 10,
          minAge: parseInt(formData.minAge) || 0,
          availableSlots: parseInt(formData.availableSlots) || 20,
          pricing: {
            basePackagePrice: parseFloat(formData.pricing.basePackagePrice) || 0,
            hotelOptions: {
              budget: { pricePerNight: parseFloat(formData.pricing.hotelOptions.budget.pricePerNight) || 0 },
              standard: { pricePerNight: parseFloat(formData.pricing.hotelOptions.standard.pricePerNight) || 0 },
              luxury: { pricePerNight: parseFloat(formData.pricing.hotelOptions.luxury.pricePerNight) || 0 }
            },
            transportOptions: {
              flight: { basePrice: parseFloat(formData.pricing.transportOptions.flight.basePrice) || 0 },
              train: { basePrice: parseFloat(formData.pricing.transportOptions.train.basePrice) || 0 },
              bus: { basePrice: parseFloat(formData.pricing.transportOptions.bus.basePrice) || 0 }
            }
          }
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
                      placeholder="Enter phone number (10 digits)"
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

              {/* Hotel Form */}
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
                    <label>Hotel Name *</label>
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
                    <label>Type *</label>
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
                    <label>City *</label>
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
                    <label>Address *</label>
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
                    <label>Distance *</label>
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
                    <label>Title *</label>
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
                    <label>Description *</label>
                    <textarea
                      name="desc"
                      value={formData.desc}
                      onChange={handleInputChange}
                      placeholder="Enter hotel description"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Rating *</label>
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
                    <label>Cheapest Price (₹) *</label>
                    <input
                      type="number"
                      name="cheapestPrice"
                      value={formData.cheapestPrice}
                      onChange={handleInputChange}
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Room Numbers (comma-separated) *</label>
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

                  <div className="formInput">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter hotel email"
                      pattern="^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$"
                    />
                  </div>

                  <div className="formInput">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter hotel phone number"
                      pattern="[0-9]{10,15}"
                    />
                  </div>
                </>
              )}

              {/* Bus Form */}
              {pageType === "buses" && (
                <>
                  <div className="formInput">
                    <label>Bus Number *</label>
                    <input
                      type="text"
                      name="busNumber"
                      value={formData.busNumber}
                      onChange={handleInputChange}
                      placeholder="Enter bus number"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Operator Name *</label>
                    <input
                      type="text"
                      name="operator.name"
                      value={formData.operator.name}
                      onChange={handleInputChange}
                      placeholder="Enter operator name"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Operator Code</label>
                    <input
                      type="text"
                      name="operator.code"
                      value={formData.operator.code}
                      onChange={handleInputChange}
                      placeholder="Enter operator code"
                    />
                  </div>

                  <div className="formInput">
                    <label>Bus Type *</label>
                    <select
                      name="busType"
                      value={formData.busType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="ac_seater">AC Seater</option>
                      <option value="non_ac_seater">Non-AC Seater</option>
                      <option value="ac_sleeper">AC Sleeper</option>
                      <option value="non_ac_sleeper">Non-AC Sleeper</option>
                    </select>
                  </div>

                  <div className="formInput">
                    <label>Total Seats *</label>
                    <input
                      type="number"
                      name="seating.totalSeats"
                      value={formData.seating.totalSeats}
                      onChange={handleInputChange}
                      placeholder="Enter total seats"
                      min="1"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Origin *</label>
                    <input
                      type="text"
                      name="route.origin"
                      value={formData.route.origin}
                      onChange={handleInputChange}
                      placeholder="Enter origin city"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Destination *</label>
                    <input
                      type="text"
                      name="route.destination"
                      value={formData.route.destination}
                      onChange={handleInputChange}
                      placeholder="Enter destination city"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Departure Time *</label>
                    <input
                      type="time"
                      name="schedule.departureTime"
                      value={formData.schedule.departureTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Arrival Time *</label>
                    <input
                      type="time"
                      name="schedule.arrivalTime"
                      value={formData.schedule.arrivalTime}
                      onChange={handleInputChange}
                      required
                    />
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
                      step="0.01"
                      required
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
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </>
              )}

              {/* Flight Form */}
              {pageType === "flights" && (
                <>
                  <div className="formInput">
                    <label>Flight Number *</label>
                    <input
                      type="text"
                      name="flightNumber"
                      value={formData.flightNumber}
                      onChange={handleInputChange}
                      placeholder="Enter flight number"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Airline Name *</label>
                    <input
                      type="text"
                      name="airline.name"
                      value={formData.airline.name}
                      onChange={handleInputChange}
                      placeholder="Enter airline name"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Airline Code</label>
                    <input
                      type="text"
                      name="airline.code"
                      value={formData.airline.code}
                      onChange={handleInputChange}
                      placeholder="Enter airline code"
                    />
                  </div>

                  <div className="formInput">
                    <label>Aircraft Model</label>
                    <input
                      type="text"
                      name="aircraft.model"
                      value={formData.aircraft.model}
                      onChange={handleInputChange}
                      placeholder="Enter aircraft model"
                    />
                  </div>

                  <div className="formInput">
                    <label>Aircraft Capacity</label>
                    <input
                      type="number"
                      name="aircraft.capacity"
                      value={formData.aircraft.capacity}
                      onChange={handleInputChange}
                      placeholder="Enter aircraft capacity"
                      min="1"
                    />
                  </div>

                  <div className="formInput">
                    <label>Origin *</label>
                    <input
                      type="text"
                      name="route.origin"
                      value={formData.route.origin}
                      onChange={handleInputChange}
                      placeholder="Enter origin airport"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Destination *</label>
                    <input
                      type="text"
                      name="route.destination"
                      value={formData.route.destination}
                      onChange={handleInputChange}
                      placeholder="Enter destination airport"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Departure Time *</label>
                    <input
                      type="datetime-local"
                      name="schedule.departureTime"
                      value={formData.schedule.departureTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Arrival Time *</label>
                    <input
                      type="datetime-local"
                      name="schedule.arrivalTime"
                      value={formData.schedule.arrivalTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Economy Base Price (₹) *</label>
                    <input
                      type="number"
                      name="pricing.economy.basePrice"
                      value={formData.pricing.economy.basePrice}
                      onChange={handleInputChange}
                      placeholder="Enter economy price"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Economy Total Seats</label>
                    <input
                      type="number"
                      name="pricing.economy.totalSeats"
                      value={formData.pricing.economy.totalSeats}
                      onChange={handleInputChange}
                      placeholder="Enter economy seats"
                      min="1"
                    />
                  </div>

                  <div className="formInput">
                    <label>Business Base Price (₹)</label>
                    <input
                      type="number"
                      name="pricing.business.basePrice"
                      value={formData.pricing.business.basePrice}
                      onChange={handleInputChange}
                      placeholder="Enter business price"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="formInput">
                    <label>Business Total Seats</label>
                    <input
                      type="number"
                      name="pricing.business.totalSeats"
                      value={formData.pricing.business.totalSeats}
                      onChange={handleInputChange}
                      placeholder="Enter business seats"
                      min="1"
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
                      <option value="delayed">Delayed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </>
              )}

              {/* Train Form */}
              {pageType === "trains" && (
                <>
                  <div className="formInput">
                    <label>Train Number *</label>
                    <input
                      type="text"
                      name="trainNumber"
                      value={formData.trainNumber}
                      onChange={handleInputChange}
                      placeholder="Enter train number"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Train Name *</label>
                    <input
                      type="text"
                      name="trainName"
                      value={formData.trainName}
                      onChange={handleInputChange}
                      placeholder="Enter train name"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Train Type *</label>
                    <select
                      name="trainType"
                      value={formData.trainType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="express">Express</option>
                      <option value="superfast">Superfast</option>
                      <option value="passenger">Passenger</option>
                      <option value="metro">Metro</option>
                      <option value="bullet">Bullet Train</option>
                    </select>
                  </div>

                  <div className="formInput">
                    <label>Origin *</label>
                    <input
                      type="text"
                      name="route.origin"
                      value={formData.route.origin}
                      onChange={handleInputChange}
                      placeholder="Enter origin station"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Destination *</label>
                    <input
                      type="text"
                      name="route.destination"
                      value={formData.route.destination}
                      onChange={handleInputChange}
                      placeholder="Enter destination station"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Departure Time *</label>
                    <input
                      type="time"
                      name="schedule.departureTime"
                      value={formData.schedule.departureTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Arrival Time *</label>
                    <input
                      type="time"
                      name="schedule.arrivalTime"
                      value={formData.schedule.arrivalTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Pantry Available</label>
                    <input
                      type="checkbox"
                      name="pantryAvailable"
                      checked={formData.pantryAvailable}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="formInput">
                    <label>WiFi Available</label>
                    <input
                      type="checkbox"
                      name="wifiAvailable"
                      checked={formData.wifiAvailable}
                      onChange={handleInputChange}
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
                      <option value="delayed">Delayed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </>
              )}

              {/* Package Form */}
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

              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' :
                  pageType === "users" ? 'Create User' :
                  pageType === "hotels" ? 'Create Hotel' :
                  pageType === "buses" ? 'Create Bus' :
                  pageType === "flights" ? 'Create Flight' :
                  pageType === "trains" ? 'Create Train' :
                  pageType === "packages" ? 'Create Package' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;