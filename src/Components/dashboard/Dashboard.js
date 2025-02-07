import { useEffect, useState } from "react";
import {
  BsGraphUp,
  BsCartCheck,
  BsPeople,
  BsClipboardData,
} from "react-icons/bs";
import axios from "axios";
import "../../Styles/dashboard.css";
import Chart from "react-apexcharts";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalReports: 0,
  });
  const [chartData, setChartData] = useState({ series: [], options: {} });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("/api/dashboard/stats");
        setStats(data);
        setChartData({
          series: [{ name: "Sales", data: data.salesTrend }],
          options: {
            chart: { type: "line" },
            xaxis: { categories: data.salesMonths },
          },
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Dashboard Overview</h2>
      <div className="stats-container">
        <div className="stat-card">
          <BsGraphUp className="stat-icon" />
          <h3>${stats.totalSales}</h3>
          <p>Total Sales</p>
        </div>
        <div className="stat-card">
          <BsCartCheck className="stat-icon" />
          <h3>{stats.totalOrders}</h3>
          <p>Total Orders</p>
        </div>
        <div className="stat-card">
          <BsPeople className="stat-icon" />
          <h3>{stats.totalCustomers}</h3>
          <p>Total Customers</p>
        </div>
        <div className="stat-card">
          <BsClipboardData className="stat-icon" />
          <h3>{stats.totalReports}</h3>
          <p>Reports Generated</p>
        </div>
      </div>
      <div className="chart-container">
        <h3>Sales Trend</h3>
        <Chart
          options={chartData.options}
          series={chartData.series}
          type="line"
          height={300}
        />
      </div>
    </div>
  );
};

export default Dashboard;
