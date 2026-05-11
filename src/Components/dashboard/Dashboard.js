import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Styles/admin-dashboard.css";

const API_URL =
  process.env.REACT_APP_API_URL ??
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://hedj.onrender.com");

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CHART_DATA = [
  { month: "Jan", value: 0.5, amount: "$38k" },
  { month: "Feb", value: 0.65, amount: "$49k" },
  { month: "Mar", value: 0.35, amount: "$26k" },
  { month: "Apr", value: 0.78, amount: "$58k" },
  { month: "May", value: 0.82, amount: "$62k" },
  { month: "Jun", value: 0.55, amount: "$42k" },
  { month: "Jul", value: 0.70, amount: "$53k" },
  { month: "Aug", value: 0.88, amount: "$67k" },
];

const RECENT_ORDERS = [
  { id: "#HJ-9402", customer: "Adrian Laurent",  initials: "AL", amount: "$12,450", status: "In Production", statusClass: "badge-amber" },
  { id: "#HJ-9401", customer: "Sophie Martin",   initials: "SM", amount: "$4,200",  status: "In Production", statusClass: "badge-amber" },
  { id: "#HJ-9399", customer: "Robert King",      initials: "RK", amount: "$28,900", status: "Shipped",       statusClass: "badge-info" },
  { id: "#HJ-9388", customer: "Eleanor Vance",   initials: "EV", amount: "$7,500",  status: "Installed",     statusClass: "badge-success" },
];

const ALERTS = [
  {
    type: "error",
    tag: "Low Stock Alert",
    name: "Midnight Brass Handles",
    desc: "Only 4 units remaining in main warehouse.",
    action: "Reorder Now",
  },
  {
    type: "gold",
    tag: "New Quote Request",
    name: "Custom Dining Suite",
    desc: "Inquiry from Studio Arches regarding Bulk pricing.",
    time: "2 hours ago",
  },
];

const REV_COLLECTIONS = [
  { name: "Heritage Oak",     pct: 42, color: "var(--color-primary)" },
  { name: "Minimalist Slate", pct: 35, color: "var(--color-on-tertiary-container)" },
  { name: "Outdoor Series",   pct: 23, color: "var(--color-secondary)" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSales: 450210,
    totalOrders: 124,
    totalCustomers: 890,
    pendingQuotes: 12,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/dashboard`, { withCredentials: true });
        if (res.data) setStats(res.data);
      } catch {
        // use seed stats silently
      }
    };
    fetchStats();
  }, []);

  const KPI_CARDS = [
    { label: "Total Sales",     value: `$${stats.totalSales?.toLocaleString() || "450,210"}`, icon: "payments",        iconClass: "kpi-icon-navy", trend: "+12.4%", trendClass: "up" },
    { label: "Orders",          value: stats.totalOrders || 124,                               icon: "shopping_basket", iconClass: "kpi-icon-sand", trend: "+8%",    trendClass: "up" },
    { label: "Customers",       value: stats.totalCustomers || 890,                            icon: "person_add",      iconClass: "kpi-icon-gold", trend: "Stable", trendClass: "neutral" },
    { label: "Pending Quotes",  value: stats.pendingQuotes || 12,                              icon: "pending_actions", iconClass: "kpi-icon-red",  trend: "High Priority", trendClass: "high" },
  ];

  return (
    <div className="dash-page">

      {/* Header */}
      <div className="dash-header">
        <div className="dash-header-left">
          <p className="dash-eyebrow">Overview Dashboard</p>
          <h2>System Performance</h2>
        </div>
        <div className="dash-header-actions">
          <button className="dash-date-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_today</span>
            Last 30 Days
          </button>
          <button className="dash-export-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {KPI_CARDS.map(c => (
          <div className="kpi-card" key={c.label}>
            <div className="kpi-card-top">
              <div className={`kpi-icon ${c.iconClass}`}>
                <span className="material-symbols-outlined">{c.icon}</span>
              </div>
              <span className={`kpi-trend ${c.trendClass}`}>
                {c.trendClass === "up" && <span className="material-symbols-outlined" style={{ fontSize: 14 }}>trending_up</span>}
                {c.trend}
              </span>
            </div>
            <p className="kpi-label">{c.label}</p>
            <p className="kpi-value">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Bento Grid */}
      <div className="dash-bento">

        {/* Monthly Sales Chart */}
        <div className="dash-card bento-chart">
          <div className="dash-card-header">
            <span className="dash-card-title">Monthly Sales Trend</span>
            <div className="chart-legend">
              <div className="chart-legend-item"><div className="chart-legend-dot" style={{ background: "var(--color-primary)" }} /> Current Year</div>
              <div className="chart-legend-item"><div className="chart-legend-dot" style={{ background: "var(--color-outline-variant)" }} /> Previous</div>
            </div>
          </div>
          <div className="dash-card-body">
            <div style={{ position: "relative" }}>
              <div className="chart-bars">
                {CHART_DATA.map(d => (
                  <div
                    key={d.month}
                    className="chart-bar"
                    style={{ height: `${d.value * 100}%` }}
                    title={`${d.month}: ${d.amount}`}
                  >
                    <span className="tooltip">{d.amount}</span>
                  </div>
                ))}
              </div>
              <div className="chart-x-labels">
                {CHART_DATA.map(d => (
                  <span key={d.month} className="chart-x-label">{d.month}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bento-quick" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="quick-actions-card">
            <p className="quick-actions-title">Quick Actions</p>
            {[
              { icon: "add_circle",    label: "Create New Quote",      path: "/admin/leads" },
              { icon: "inventory",     label: "Add Product",            path: "/admin/products" },
              { icon: "meeting_room",  label: "New Showroom Booking",   path: "/contact" },
            ].map(({ icon, label, path }) => (
              <button key={label} className="quick-action-btn" onClick={() => navigate(path)}>
                <span className="material-symbols-outlined">{icon}</span>
                {label}
              </button>
            ))}
          </div>
          <div className="rev-collection">
            <p className="rev-title">Revenue by Collection</p>
            {REV_COLLECTIONS.map(c => (
              <div className="rev-row" key={c.name}>
                <div className="rev-dot" style={{ background: c.color }} />
                <div className="rev-bar-wrap">
                  <div className="rev-bar-label">
                    <span>{c.name}</span>
                    <span>{c.pct}%</span>
                  </div>
                  <div className="rev-bar-track">
                    <div className="rev-bar-fill" style={{ width: `${c.pct}%`, background: c.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="dash-card bento-orders">
          <div className="dash-card-header">
            <span className="dash-card-title">Recent Orders</span>
            <button className="dash-card-link" onClick={() => navigate("/admin/orders")}>View All Orders</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map(o => (
                  <tr key={o.id}>
                    <td><span className="order-id">{o.id}</span></td>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-initials">{o.initials}</div>
                        <span>{o.customer}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{o.amount}</td>
                    <td><span className={`badge-status ${o.statusClass}`}>{o.status}</span></td>
                    <td>
                      <button className="action-dot-btn">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_horiz</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="dash-card bento-alerts">
          <div className="dash-card-header">
            <span className="dash-card-title">Alerts</span>
            <div className="alert-dot" />
          </div>
          <div className="dash-card-body alerts-card" style={{ padding: "16px 20px" }}>
            {ALERTS.map((a, i) => (
              <div key={i} className={`alert-item alert-${a.type}`}>
                <p className="alert-tag">{a.tag}</p>
                <p className="alert-name">{a.name}</p>
                <p className="alert-desc">{a.desc}</p>
                {a.action && <button className="alert-action">{a.action}</button>}
                {a.time && <p className="alert-time">{a.time}</p>}
              </div>
            ))}
            {/* Promo card */}
            <div className="alert-promo">
              <div className="alert-promo-img" style={{ position: "relative" }}>
                <img
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80"
                  alt="New Collection"
                />
                <p className="alert-promo-label">New Collection Launch</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
