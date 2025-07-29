import "./sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import StoreIcon from "@mui/icons-material/Store";
import HotelIcon from "@mui/icons-material/Hotel";
import FlightIcon from "@mui/icons-material/Flight";
import TrainIcon from "@mui/icons-material/Train";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CardTravelIcon from "@mui/icons-material/CardTravel";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsSystemDaydreamOutlinedIcon from "@mui/icons-material/SettingsSystemDaydreamOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { Link } from "react-router-dom";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext } from "react";

const Sidebar = () => {
  const { dispatch } = useContext(DarkModeContext);
  return (
    <div className="sidebar">
      <div className="top">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">Admin</span>
        </Link>
      </div>
      <hr />
      <div className="center">
        <ul>
          <p className="title">MAIN</p>
          <li>
            <DashboardIcon className="icon" />
            <span>Dashboard</span>
          </li>
          <p className="title">USER MANAGEMENT</p>
          <Link to="/users" style={{ textDecoration: "none" }}>
            <li>
              <PersonOutlineIcon className="icon" />
              <span>Users</span>
            </li>
          </Link>

          <p className="title">TRAVEL SERVICES</p>
          <Link to="/hotels" style={{ textDecoration: "none" }}>
            <li>
              <HotelIcon className="icon" />
              <span>Hotels</span>
            </li>
          </Link>
          <Link to="/flights" style={{ textDecoration: "none" }}>
            <li>
              <FlightIcon className="icon" />
              <span>Flights</span>
            </li>
          </Link>
          <Link to="/trains" style={{ textDecoration: "none" }}>
            <li>
              <TrainIcon className="icon" />
              <span>Trains</span>
            </li>
          </Link>
          <Link to="/buses" style={{ textDecoration: "none" }}>
            <li>
              <DirectionsBusIcon className="icon" />
              <span>Buses</span>
            </li>
          </Link>
          <Link to="/packages" style={{ textDecoration: "none" }}>
            <li>
              <CardTravelIcon className="icon" />
              <span>Packages</span>
            </li>
          </Link>

          <p className="title">BOOKING MANAGEMENT</p>
          <Link to="/travel-bookings" style={{ textDecoration: "none" }}>
            <li>
              <BookOnlineIcon className="icon" />
              <span>Travel Bookings</span>
            </li>
          </Link>
          <Link to="/hotel-bookings" style={{ textDecoration: "none" }}>
            <li>
              <HotelIcon className="icon" />
              <span>Hotel Bookings</span>
            </li>
          </Link>
          <Link to="/package-bookings" style={{ textDecoration: "none" }}>
            <li>
              <CardTravelIcon className="icon" />
              <span>Package Bookings</span>
            </li>
          </Link>
          <Link to="/universal-bookings" style={{ textDecoration: "none" }}>
            <li>
              <ReceiptIcon className="icon" />
              <span>All Bookings</span>
            </li>
          </Link>
          <Link to="/bookings" style={{ textDecoration: "none" }}>
            <li>
              <ReceiptIcon className="icon" />
              <span>New Bookings</span>
            </li>
          </Link>
        </ul>
      </div>
      <div className="bottom">
        <div
          className="colorOption"
          onClick={() => dispatch({ type: "LIGHT" })}
        ></div>
        <div
          className="colorOption"
          onClick={() => dispatch({ type: "DARK" })}
        ></div>
      </div>
    </div>
  );
};

export default Sidebar;
