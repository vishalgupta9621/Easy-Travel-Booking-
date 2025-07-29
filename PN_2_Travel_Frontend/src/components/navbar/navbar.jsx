import "./navbar.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="navbar">
      <div className="navContainer">
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="logo">
            <span className="logoMain">TRAVEL</span>
            <span className="logoSub">bookings</span>
          </div>
        </Link>
        <div className="navItems">
          {isAuthenticated ? (
            <>
              <span className="welcomeText">
                Welcome, {user?.firstName || user?.username}!
              </span>
              <Link to="/account" style={{ textDecoration: "none" }}>
                <button className="navButton account">My Account</button>
              </Link>
              <button className="navButton logout" onClick={handleLogout}>
                Logout
              </button>
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