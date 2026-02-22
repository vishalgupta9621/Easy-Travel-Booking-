import "./navbar.scss";
import { useContext, useState, useEffect } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FullscreenExitOutlinedIcon from "@mui/icons-material/FullscreenExitOutlined";

const Navbar = () => {
  const { dispatch } = useContext(DarkModeContext);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="navbar">
      <div className="wrapper">
        <div className="logo">
          <h2>Travel Booking</h2>
        </div>

        <div className="items">
          <div className="item">
            <DarkModeOutlinedIcon
              className="icon"
              onClick={() => dispatch({ type: "TOGGLE" })}
              titleAccess="Toggle Dark Mode"
            />
          </div>

          <div className="item">
            <FullscreenExitOutlinedIcon
              className="icon"
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen();
                } else {
                  document.exitFullscreen();
                }
              }}
              titleAccess="Toggle Fullscreen"
            />
          </div>

          <div className="item">
            <span>{currentTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
