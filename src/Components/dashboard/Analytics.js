import { useEffect, useState } from "react";
import { commerceApi } from "../../services/api";
import "../../Styles/admin-dashboard.css";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadAnalytics = async () => {
      try {
        const data = await commerceApi.getAnalytics();
        if (mounted) {
          setAnalytics(data);
          setError("");
        }
      } catch {
        if (mounted) setError("Analytics could not be loaded.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAnalytics();
    return () => {
      mounted = false;
    };
  }, []);

  const months = analytics?.salesMonths || [];
  const trend = analytics?.salesTrend || [];
  const maxValue = Math.max(...trend, 1);

  return (
    <div className="admin-page-stack">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Analytics</p>
          <h2>Commerce Analytics</h2>
        </div>
      </div>

      {loading && <div className="kitchen-state">Loading analytics...</div>}
      {!loading && error && <div className="kitchen-state kitchen-state-error">{error}</div>}

      {!loading && !error && analytics && (
        <>
          <div className="admin-grid-3">
            <div className="admin-stat-card">
              <span>Total Sales</span>
              <strong>${Number(analytics.totalSales || 0).toLocaleString()}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Orders</span>
              <strong>{analytics.totalOrders || 0}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Customers</span>
              <strong>{analytics.totalCustomers || 0}</strong>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title">Sales Trend</span>
              <span className="admin-muted">Demo data updates as checkout creates orders</span>
            </div>
            <div className="dash-card-body">
              <div className="chart-bars">
                {months.map((month, index) => (
                  <div
                    key={month}
                    className="chart-bar"
                    style={{ height: `${Math.max(12, (Number(trend[index] || 0) / maxValue) * 100)}%` }}
                    title={`${month}: $${Number(trend[index] || 0).toLocaleString()}`}
                  >
                    <span className="tooltip">${Number(trend[index] || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="chart-x-labels">
                {months.map((month) => (
                  <span key={month} className="chart-x-label">{month}</span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
