import "./featured.scss";
import { useState, useEffect } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";

const Featured = () => {
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
      <div className="featured">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="featured">
        <div className="error">Failed to load data</div>
      </div>
    );
  }

  // Calculate progress percentage (this month vs target)
  const target = 100000; // ₹1 lakh target
  const thisMonthRevenue = stats.thisMonth.revenue;
  const progressPercentage = Math.min((thisMonthRevenue / target) * 100, 100);

  const formatCurrency = (amount) => {
    return `₹${(amount / 1000).toFixed(1)}k`;
  };
  return (
    <div className="featured">
      <div className="top">
        <h1 className="title">Monthly Revenue</h1>
        <MoreVertIcon fontSize="small" />
      </div>
      <div className="bottom">
        <div className="featuredChart">
          <CircularProgressbar
            value={progressPercentage}
            text={`${Math.round(progressPercentage)}%`}
            strokeWidth={5}
          />
        </div>
        <p className="title">Revenue made this month</p>
        <p className="amount">{formatCurrency(thisMonthRevenue)}</p>
        <p className="desc">
          Target: {formatCurrency(target)}. Previous transactions processing.
        </p>
        <div className="summary">
          <div className="item">
            <div className="itemTitle">Target</div>
            <div className={`itemResult ${progressPercentage >= 100 ? 'positive' : 'negative'}`}>
              {progressPercentage >= 100 ?
                <KeyboardArrowUpOutlinedIcon fontSize="small"/> :
                <KeyboardArrowDownIcon fontSize="small"/>
              }
              <div className="resultAmount">{formatCurrency(target)}</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">This Month</div>
            <div className={`itemResult ${stats.overview.revenuePercentageChange >= 0 ? 'positive' : 'negative'}`}>
              {stats.overview.revenuePercentageChange >= 0 ?
                <KeyboardArrowUpOutlinedIcon fontSize="small"/> :
                <KeyboardArrowDownIcon fontSize="small"/>
              }
              <div className="resultAmount">{formatCurrency(thisMonthRevenue)}</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Last Month</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize="small"/>
              <div className="resultAmount">{formatCurrency(stats.lastMonth.revenue)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;
