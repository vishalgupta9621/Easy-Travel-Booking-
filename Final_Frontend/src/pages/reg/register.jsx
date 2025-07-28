import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";
import { publicRequest } from "../../api";

const Register = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    email: "",
    phone: "",
    address: {
      street1: "",
      street2: "",
      city: "",
      region: "",
      postalCode: "",
      country: ""
    }
  });

  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.id in credentials.address) {
      setCredentials((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [e.target.id]: e.target.value
        }
      }));
    } else {
      setCredentials((prev) => ({
        ...prev,
        [e.target.id]: e.target.value,
      }));
    }
    // Clear error when user starts typing
    if (validationErrors[e.target.id]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[e.target.id];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const errors = {};
    if (!credentials.username.trim()) errors.username = "Username is required";
    if (!credentials.password || credentials.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    if (!credentials.firstName.trim()) errors.firstName = "First name is required";
    if (!credentials.lastName.trim()) errors.lastName = "Last name is required";
    if (!credentials.birthDate) errors.birthDate = "Birth date is required";
    if (!credentials.email.includes("@")) errors.email = "Valid email is required";
    if (!credentials.phone.trim()) errors.phone = "Phone number is required";
    if (!credentials.address.street1.trim()) errors.street1 = "Street address is required";
    if (!credentials.address.city.trim()) errors.city = "City is required";
    if (!credentials.address.region.trim()) errors.region = "Region is required";
    if (!credentials.address.postalCode.trim()) errors.postalCode = "Postal code is required";
    if (!credentials.address.country.trim()) errors.country = "Country is required";

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Scroll to first error on mobile
      if (window.innerWidth < 768) {
        const firstError = Object.keys(errors)[0];
        document.getElementById(firstError)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
      return;
    }

    try {
      await publicRequest.post("/auth/register", credentials);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="registerform">
      <div className="rContainer">
        <h1>TRAVEL</h1>
        <p className="subtitle">The world</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="formSection">
            <h3>Account Details</h3>
            <div className="input-group">
              <input
                type="text"
                placeholder="Username"
                id="username"
                onChange={handleChange}
                className={`rInput ${validationErrors.username ? 'error-border' : ''}`}
              />
              {validationErrors.username && (
                <span className="error-message">{validationErrors.username}</span>
              )}
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                id="password"
                onChange={handleChange}
                className={`rInput ${validationErrors.password ? 'error-border' : ''}`}
              />
              {validationErrors.password && (
                <span className="error-message">{validationErrors.password}</span>
              )}
            </div>
          </div>
          
          <div className="formSection">
            <h3>Personal Information</h3>
            <div className="nameFields">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="First Name"
                  id="firstName"
                  onChange={handleChange}
                  className={`rInput ${validationErrors.firstName ? 'error-border' : ''}`}
                />
                {validationErrors.firstName && (
                  <span className="error-message">{validationErrors.firstName}</span>
                )}
              </div>
              
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Last Name"
                  id="lastName"
                  onChange={handleChange}
                  className={`rInput ${validationErrors.lastName ? 'error-border' : ''}`}
                />
                {validationErrors.lastName && (
                  <span className="error-message">{validationErrors.lastName}</span>
                )}
              </div>
            </div>

            <div className="input-group">
              <input
                type="date"
                placeholder="Birth Date"
                id="birthDate"
                onChange={handleChange}
                className={`rInput ${validationErrors.birthDate ? 'error-border' : ''}`}
              />
              {validationErrors.birthDate && (
                <span className="error-message">{validationErrors.birthDate}</span>
              )}
            </div>
          </div>

          <div className="formSection">
            <h3>Contact Information</h3>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                id="email"
                onChange={handleChange}
                className={`rInput ${validationErrors.email ? 'error-border' : ''}`}
              />
              {validationErrors.email && (
                <span className="error-message">{validationErrors.email}</span>
              )}
            </div>

            <div className="input-group">
              <input
                type="tel"
                placeholder="Phone Number"
                id="phone"
                onChange={handleChange}
                className={`rInput ${validationErrors.phone ? 'error-border' : ''}`}
              />
              {validationErrors.phone && (
                <span className="error-message">{validationErrors.phone}</span>
              )}
            </div>
          </div>

          <div className="formSection">
            <h3>Address</h3>
            <div className="input-group">
              <input
                type="text"
                placeholder="Street Address"
                id="street1"
                onChange={handleChange}
                className={`rInput ${validationErrors.street1 ? 'error-border' : ''}`}
              />
              {validationErrors.street1 && (
                <span className="error-message">{validationErrors.street1}</span>
              )}
            </div>

            <div className="input-group">
              <input
                type="text"
                placeholder="Street Address Line 2"
                id="street2"
                onChange={handleChange}
                className="rInput"
              />
            </div>

            <div className="addressRow">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="City"
                  id="city"
                  onChange={handleChange}
                  className={`rInput ${validationErrors.city ? 'error-border' : ''}`}
                />
                {validationErrors.city && (
                  <span className="error-message">{validationErrors.city}</span>
                )}
              </div>

              <div className="input-group">
                <input
                  type="text"
                  placeholder="Region"
                  id="region"
                  onChange={handleChange}
                  className={`rInput ${validationErrors.region ? 'error-border' : ''}`}
                />
                {validationErrors.region && (
                  <span className="error-message">{validationErrors.region}</span>
                )}
              </div>
            </div>

            <div className="addressRow">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Postal/Zip Code"
                  id="postalCode"
                  onChange={handleChange}
                  className={`rInput ${validationErrors.postalCode ? 'error-border' : ''}`}
                />
                {validationErrors.postalCode && (
                  <span className="error-message">{validationErrors.postalCode}</span>
                )}
              </div>

              <div className="input-group">
                <input
                  type="text"
                  placeholder="Country"
                  id="country"
                  onChange={handleChange}
                  className={`rInput ${validationErrors.country ? 'error-border' : ''}`}
                />
                {validationErrors.country && (
                  <span className="error-message">{validationErrors.country}</span>
                )}
              </div>
            </div>
          </div>

          <button type="submit" className="rButton">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;