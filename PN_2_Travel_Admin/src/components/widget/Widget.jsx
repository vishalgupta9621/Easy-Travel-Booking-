import "./widget.scss";
import { useState, useEffect } from "react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";

const Widget = ({ type }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:8800/api/v1/dashboard/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="widget">
        <div className="loading">Loading...</div>
      </div>
    );
  }
  let data;

  if (!stats) {
    return (
      <div className="widget">
        <div className="error">Failed to load data</div>
      </div>
    );
  }

  const getPercentageIcon = (percentage) => {
    return percentage >= 0 ? (
      <KeyboardArrowUpIcon className="icon positive" />
    ) : (
      <KeyboardArrowDownIcon className="icon negative" />
    );
  };

  switch (type) {
    case "user":
      data = {
        title: "USERS",
        isMoney: false,
        link: "See all users",
        amount: stats.overview.totalUsers,
        diff: stats.overview.userPercentageChange,
        icon: (
          <PersonOutlinedIcon
            className="icon"
            style={{
              color: "crimson",
              backgroundColor: "rgba(255, 0, 0, 0.2)",
            }}
          />
        ),
      };
      break;
    case "order":
      data = {
        title: "BOOKINGS",
        isMoney: false,
        link: "View all bookings",
        amount: stats.overview.totalBookings,
        diff: stats.overview.bookingPercentageChange,
        icon: (
          <ShoppingCartOutlinedIcon
            className="icon"
            style={{
              backgroundColor: "rgba(218, 165, 32, 0.2)",
              color: "goldenrod",
            }}
          />
        ),
      };
      break;
    case "earning":
      data = {
        title: "EARNINGS",
        isMoney: true,
        link: "View net earnings",
        amount: stats.overview.totalRevenue,
        diff: stats.overview.revenuePercentageChange,
        isMoney: true,
        link: "View net earnings",
        icon: (
          <MonetizationOnOutlinedIcon
            className="icon"
            style={{ backgroundColor: "rgba(0, 128, 0, 0.2)", color: "green" }}
          />
        ),
      };
      break;
    case "balance":
      data = {
        title: "SERVICES",
        isMoney: false,
        link: "See all services",
        amount: stats.overview.totalServices,
        diff: 0, // Services don't change frequently
        icon: (
          <AccountBalanceWalletOutlinedIcon
            className="icon"
            style={{
              backgroundColor: "rgba(128, 0, 128, 0.2)",
              color: "purple",
            }}
          />
        ),
      };
      break;
    default:
      break;
  }

  return (
    <div className="widget">
      <div className="left">
        <span className="title">{data.title}</span>
        <span className="counter">
          {data.isMoney && "₹"} {data.amount?.toLocaleString() || 0}
        </span>
        <span className="link">{data.link}</span>
      </div>
      <div className="right">
        <div className={`percentage ${data.diff >= 0 ? 'positive' : 'negative'}`}>
          {getPercentageIcon(data.diff)}
          {Math.abs(data.diff)} %
        </div>
        {data.icon}
      </div>
    </div>
  );
};

export default Widget;
