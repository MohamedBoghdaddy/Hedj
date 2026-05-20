import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "../Components/AdminShell";
import { getAuthHeaders } from "../services/authHeaders";
import "../Styles/admin-premium.css";

const API_URL =
  process.env.REACT_APP_API_URL ??
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://hedj.onrender.com");

const money = (v) => `$${Number(v || 0).toLocaleString()}`;

const STATUS_CLASS = {
  Active: "status-active",
  "In Review": "status-review",
  Low: "status-flagged",
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [months, setMonths] = useState("6");

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch(`${API_URL}/api/admin/analytics/overview?months=${months}`, {
        credentials: "include",
        headers: getAuthHeaders({}),
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(JSON.parse(t).message || `HTTP ${resp.status}`);
      }
      setData(await resp.json());
    } catch (err) {
      setError(err.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, [months]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const resp = await fetch(`${API_URL}/api/admin/analytics/export.csv`, {
        credentials: "include",
        headers: getAuthHeaders({}),
      });
      if (!resp.ok) throw new Error(`Export failed: ${resp.status}`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hedj-analytics-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`CSV export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const categoryBars = data?.categoryBars || [];
  const performanceRows = data?.performanceRows || [];

  const metrics = data
    ? [
        { title: "Total Revenue", value: money(data.totalSales), badge: `${data.totalOrders} orders` },
        { title: "Avg Order Value", value: money(data.avgOrderValue), badge: "per order" },
        { title: "Lead Conversion", value: `${data.leadConversionRate}%`, badge: "of leads won" },
        { title: "Quote Conversion", value: `${data.quoteConversionRate}%`, badge: "of quotes accepted" },
      ]
    : [];

  return (
    <AdminShell
      active="Reports"
      title="Analytics Dashboard"
      subtitle="Real performance metrics from MongoDB"
      actions={
        <>
          <button
            className="admin-premium-button"
            type="button"
            onClick={handleExportCSV}
            disabled={exporting || loading}
          >
            <span className="material-symbols-outlined">file_download</span>
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </>
      }
    >
      {/* Filters */}
      <section className="admin-filter-card">
        <div className="admin-filter-grid">
          <div className="admin-field">
            <label htmlFor="analytics-months">Time Range</label>
            <select id="analytics-months" value={months} onChange={(e) => setMonths(e.target.value)}>
              <option value="3">Last 3 months</option>
              <option value="6">Last 6 months</option>
              <option value="12">Last 12 months</option>
            </select>
          </div>
          <button
            className="admin-premium-button"
            type="button"
            onClick={loadAnalytics}
            disabled={loading}
          >
            {loading ? "Loading…" : "Apply"}
          </button>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div style={{ background: "#fff1f0", padding: "12px 16px", borderRadius: 8, color: "#dc2626", marginBottom: 24 }}>
          {error}
          <button className="admin-premium-button" type="button" onClick={loadAnalytics} style={{ marginLeft: 12 }}>
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && <div className="kitchen-state">Loading analytics…</div>}

      {!loading && !error && data && (
        <>
          {/* KPI metrics */}
          <section className="admin-metrics-grid">
            {metrics.map((m) => (
              <div key={m.title} className="admin-metric-card">
                <p className="admin-card-kicker">{m.title}</p>
                <span>{m.badge}</span>
                <h3>{m.value}</h3>
              </div>
            ))}
          </section>

          <section className="admin-analytics-grid">
            {/* Category bars */}
            <div className="admin-chart-card">
              <div className="admin-card-header">
                <h2>Revenue by Category</h2>
                <span className="admin-card-kicker">
                  {categoryBars.length} categories
                </span>
              </div>
              {categoryBars.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 13, padding: "16px 0" }}>
                  No order data yet. Place orders to see category revenue.
                </p>
              ) : (
                <div className="admin-bar-chart">
                  {categoryBars.map((bar) => (
                    <div className="admin-bar" key={bar.label} title={`${bar.label}: ${money(bar.revenue)} — ${bar.unitsSold} units`}>
                      <div className="admin-bar-fill" style={{ height: `${bar.height}%` }} />
                      <span>{bar.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Insights */}
            <aside className="admin-insights-card">
              <div className="admin-insights-content" style={{ padding: "24px" }}>
                <h2>Live Insights</h2>
                <p>
                  {data.totalCustomers} customers have placed {data.totalOrders} orders
                  generating {money(data.totalSales)} in revenue.
                </p>
                {data.lowStockCount > 0 && (
                  <p>
                    <span className="material-symbols-outlined">warning</span>{" "}
                    {data.lowStockCount} product(s) below safety stock threshold.
                  </p>
                )}
                {data.leadConversionRate > 0 && (
                  <p>
                    <span className="material-symbols-outlined">check_circle</span>{" "}
                    {data.leadConversionRate}% lead-to-win conversion rate.
                  </p>
                )}
                {data.quoteConversionRate > 0 && (
                  <p>
                    <span className="material-symbols-outlined">check_circle</span>{" "}
                    {data.quoteConversionRate}% quote acceptance rate.
                  </p>
                )}
              </div>
            </aside>
          </section>

          {/* Performance log */}
          <section className="admin-table-card">
            <div className="admin-card-header">
              <h2>Top Products by Revenue</h2>
            </div>
            {performanceRows.length === 0 ? (
              <p style={{ padding: "16px", color: "#94a3b8" }}>
                No order data yet. Create orders to see product performance.
              </p>
            ) : (
              <div className="admin-premium-table-wrap">
                <table className="admin-premium-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Units Sold</th>
                      <th>Revenue</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.name}</td>
                        <td>{row.unitsSold}</td>
                        <td style={{ fontWeight: 500 }}>{money(row.revenue)}</td>
                        <td>
                          <span className={`status-pill ${STATUS_CLASS[row.status] || "status-review"}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </AdminShell>
  );
}
