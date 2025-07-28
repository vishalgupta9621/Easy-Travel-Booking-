import "./navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate("/");
  };

  return (
    <div className="navbar">
      <div className="navContainer">
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="logo">
            <span className="logoIcon">✈️</span>
            <span className="logoMain">TRAVEL</span>
            <span className="logoSub">Hub</span>
          </div>
        </Link>
        
        {/* Travel Type Navigation */}
        <div className="travelNav">
          <Link to="/" className={`travelNavItem ${location.pathname === '/' ? 'active' : ''}`}>
            <span className="travelIcon">🏨</span>
            <span>Hotels</span>
          </Link>
          <Link to="/flights" className={`travelNavItem ${location.pathname === '/flights' ? 'active' : ''}`}>
            <span className="travelIcon">✈️</span>
            <span>Flights</span>
          </Link>
          <Link to="/trains" className={`travelNavItem ${location.pathname === '/trains' ? 'active' : ''}`}>
            <span className="travelIcon">🚂</span>
            <span>Trains</span>
          </Link>
          <Link to="/buses" className={`travelNavItem ${location.pathname === '/buses' ? 'active' : ''}`}>
            <span className="travelIcon">🚌</span>
            <span>Buses</span>
          </Link>
        </div>

        <div className="navItems">
          {user ? (
            <>
              <Link to="/my-bookings" style={{ textDecoration: "none" }}>
                <button className="navButton bookings">My Bookings</button>
              </Link>
              <span className="navUsername">Hello, {user.username}</span>
              <button onClick={handleLogout} className="navButton logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/register" style={{ textDecoration: "none" }}>
                <button className="navButton register">Register</button>
              </Link>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <button className="navButton login">Login</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
