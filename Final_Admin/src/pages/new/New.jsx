import "./new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../../config";

const New = ({ inputs, title }) => {
  const location = useLocation();
  const isUsersPage = location.pathname.includes("/users");
  const [file, setFile] = useState("");
  const [formData, setFormData] = useState(
    isUsersPage
      ? {
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
        }
      : {
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
        }
  );
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isUsersPage) {
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
        await axios.post(`${API_URL}/users`, userData);
        navigate("/users");
      } else {
        const hotelData = {
          ...formData,
          photos: [{
            url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60",
            index: 0,
            label: "Default hotel image"
          }],
          rooms: formData.rooms ? formData.rooms.split(',').map(room => room.trim()) : []
        };
        await axios.post(`${API_URL}/hotels`, hotelData);
        navigate("/hotels");
      }
    } catch (error) {
      console.error("Error creating:", error);
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
              {isUsersPage ? (
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
              ) : (
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

              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;
