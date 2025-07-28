import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./login.css";
import { publicRequest } from "../../api";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { loading, error, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!credentials.username || !credentials.password) {
      dispatch({ type: "LOGIN_FAILURE", payload: { message: "Please fill in all fields" } });
      return;
    }

    dispatch({ type: "LOGIN_START" });
    try {
      const res = await publicRequest.post("/auth/login", credentials);

      // Store token and user data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      dispatch({ type: "LOGIN_SUCCESS", payload: res.data.user });
      navigate("/");
    } catch (err) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: { message: err.response?.data?.message || "Login failed. Please try again." }
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <form className="login-form" onSubmit={handleClick}>
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="username"
                placeholder="Enter your username or email"
                value={credentials.username}
                onChange={handleChange}
                className="form-input"
                required
              />
              <span className="input-icon">👤</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                className="form-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="login-footer">
            <p>
              Don't have an account?
              <Link to="/register" className="register-link">
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
