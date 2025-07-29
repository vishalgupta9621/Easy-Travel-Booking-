import "./chart.scss";
import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Chart = ({ aspect, title }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const response = await fetch('http://localhost:8800/api/v1/dashboard/stats');
      const data = await response.json();
      if (data.success && data.data.monthlyRevenue) {
        const formattedData = data.data.monthlyRevenue.map(item => ({
          name: getMonthName(item._id.month),
          Total: item.total,
          Bookings: item.count
        }));
        setChartData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
    setLoading(false);
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };

  if (loading) {
    return (
      <div className="chart">
        <div className="title">{title}</div>
        <div className="loading">Loading chart data...</div>
      </div>
    );
  }
  return (
    <div className="chart">
      <div className="title">{title}</div>
      <ResponsiveContainer width="100%" aspect={aspect}>
        <AreaChart
          width={730}
          height={250}
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="gray" />
          <CartesianGrid strokeDasharray="3 3" className="chartGrid" />
          <Tooltip
            formatter={(value, name) => [
              name === 'Total' ? `₹${value.toLocaleString()}` : value,
              name === 'Total' ? 'Revenue' : name
            ]}
          />
          <Area
            type="monotone"
            dataKey="Total"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#total)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
