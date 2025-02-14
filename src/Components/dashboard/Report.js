import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Spinner, Table } from "react-bootstrap";
import { BsFileEarmarkText, BsDownload } from "react-icons/bs";
import useDashboard from "../../hooks/useDashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../../Styles/Analytics.css";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsReport = () => {
  const {
    state,
    fetchDashboardData,
    fetchProfile,
    fetchReports,
    handleDownload,
  } = useDashboard();
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data, profile, and reports on component mount
  useEffect(() => {
    fetchDashboardData();
    fetchProfile();
    fetchReports();
    setLoading(false);
  }, [fetchDashboardData, fetchProfile, fetchReports]);

  const analyticsChartData = {
    labels: ["Products", "Customers", "Employees"],
    datasets: [
      {
        label: "Count",
        data: [
          state.products?.length || 0,
          state.customers?.length || 0,
          state.employees?.length || 0,
        ],
        backgroundColor: ["#3498db", "#2ecc71", "#e74c3c"],
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="analytic-container">
      <div className="main">
        <div className="main-top">
          <h1>Analytics & Reports</h1>
        </div>

        {/* Chart for analytics */}
        <h2>Business Analytics</h2>
        <div
          className="chart-container"
          style={{ width: "60%", margin: "auto" }}
        >
          {loading ? (
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          ) : (
            <Bar data={analyticsChartData} options={chartOptions} />
          )}
        </div>

        {/* Profile Section */}
        {state.profile && (
          <>
            <h2>Profile Information</h2>
            <Table striped bordered hover>
              <tbody>
                <tr>
                  <td>Name</td>
                  <td>{state.profile.name}</td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td>{state.profile.email}</td>
                </tr>
                <tr>
                  <td>Role</td>
                  <td>{state.profile.role}</td>
                </tr>
              </tbody>
            </Table>
          </>
        )}

        {/* Settings Section */}
        <h2>Settings</h2>
        {state.settings ? (
          <Table striped bordered hover>
            <tbody>
              <tr>
                <td>Mode</td>
                <td>{state.settings.mode}</td>
              </tr>
              <tr>
                <td>Notifications</td>
                <td>{state.settings.notifications ? "Enabled" : "Disabled"}</td>
              </tr>
            </tbody>
          </Table>
        ) : (
          <p>No settings available.</p>
        )}

        {/* Reports Section */}
        <h2>Reports</h2>
        <div className="report-container">
          <div className="report-list">
            {state.reports?.length > 0 ? (
              state.reports.map((report) => (
                <div key={report.id} className="report-card">
                  <BsFileEarmarkText className="report-icon" />
                  <div className="report-info">
                    <h4>{report.title}</h4>
                    <p>{new Date(report.date).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleDownload(report.id)}
                    className="download-btn"
                  >
                    <BsDownload /> Download
                  </button>
                </div>
              ))
            ) : (
              <p>No reports available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReport;
