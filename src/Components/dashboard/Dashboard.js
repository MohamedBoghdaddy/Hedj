import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { commerceApi } from "../../services/api";
import { useAuthContext } from "../../context/AuthContext";
import { can } from "../../utils/permissions";
import "../../Styles/admin-dashboard.css";

const initials = (name = "") =>
  (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const money = (v) => `$${Number(v || 0).toLocaleString()}`;

const STATUS_CLASS = {
  new: "badge-amber", confirmed: "badge-info", in_production: "badge-amber",
  ready: "badge-info", delivered: "badge-success", cancelled: "badge-muted",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { state } = useAuthContext();
  const user = state.user;
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await commerceApi.getDashboard();
        setSummary(data);

        if (data.salesTrend?.length && data.salesMonths?.length) {
          const maxVal = Math.max(...data.salesTrend, 1);
          setChartData(
            data.salesMonths.map((month, i) => ({
              month,
              value: Math.max(0.05, (data.salesTrend[i] || 0) / maxVal),
              amount: money(data.salesTrend[i] || 0),
            }))
          );
        }
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = summary || {};
  const recentOrders = stats.recentOrders || [];
  const alerts = stats.alerts || [];
  const lowStockProducts = stats.lowStockProducts || [];

  const KPI_CARDS = [
    { label: "Total Sales",    value: stats.totalSales != null ? money(stats.totalSales) : "—",     icon: "payments",        iconClass: "kpi-icon-navy" },
    { label: "Orders",         value: stats.totalOrders ?? "—",                                      icon: "shopping_basket", iconClass: "kpi-icon-sand" },
    { label: "Customers",      value: stats.totalCustomers ?? "—",                                   icon: "person_add",      iconClass: "kpi-icon-gold" },
    { label: "Pending Quotes", value: stats.pendingQuotes ?? "—",                                    icon: "pending_actions", iconClass: "kpi-icon-red" },
  ];

  return (
    <div className="dash-page">
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
        </div>
      </div>

      {loading && <div className="kitchen-state">Loading dashboard…</div>}
      {!loading && error && (
        <div className="kitchen-state" style={{ color: "#dc2626" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* KPI Cards */}
          <div className="kpi-grid">
            {KPI_CARDS.map((c) => (
              <div className="kpi-card" key={c.label}>
                <div className="kpi-card-top">
                  <div className={`kpi-icon ${c.iconClass}`}>
                    <span className="material-symbols-outlined">{c.icon}</span>
                  </div>
                </div>
                <p className="kpi-label">{c.label}</p>
                <p className="kpi-value">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="dash-bento">
            {/* Monthly Sales Chart */}
            <div className="dash-card bento-chart">
              <div className="dash-card-header">
                <span className="dash-card-title">Monthly Revenue</span>
              </div>
              <div className="dash-card-body">
                {chartData.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: 13, padding: "16px 0" }}>
                    No sales data yet.
                  </p>
                ) : (
                  <div style={{ position: "relative" }}>
                    <div className="chart-bars">
                      {chartData.map((d) => (
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
                      {chartData.map((d) => (
                        <span key={d.month} className="chart-x-label">{d.month}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bento-quick" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="quick-actions-card">
                <p className="quick-actions-title">Quick Actions</p>
                {[
                  { icon: "add_circle",   label: "Create New Quote",   path: "/admin/leads",     permission: "quotes.create" },
                  { icon: "inventory",    label: "Add Product",         path: "/admin/products",  permission: "products.create" },
                  { icon: "badge",        label: "Invite Employee",     path: "/admin/employees", permission: "employees.invite" },
                  { icon: "receipt_long", label: "View All Orders",     path: "/admin/orders",    permission: "orders.viewAll" },
                ].filter(({ permission }) => can(user, permission))
                 .map(({ icon, label, path }) => (
                  <button key={label} className="quick-action-btn" onClick={() => navigate(path)}>
                    <span className="material-symbols-outlined">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>

              {/* Low-stock products */}
              {lowStockProducts.length > 0 && (
                <div className="rev-collection">
                  <p className="rev-title">Low Stock Products</p>
                  {lowStockProducts.map((p) => (
                    <div className="rev-row" key={p._id || p.name}>
                      <div className="rev-dot" style={{ background: "#dc2626" }} />
                      <div className="rev-bar-wrap">
                        <div className="rev-bar-label">
                          <span style={{ fontSize: 12 }}>{p.name}</span>
                          <span style={{ color: "#dc2626", fontWeight: 600 }}>{p.stock} left</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="dash-card bento-orders">
              <div className="dash-card-header">
                <span className="dash-card-title">Recent Orders</span>
                <button className="dash-card-link" onClick={() => navigate("/admin/orders")}>
                  View All
                </button>
              </div>
              {recentOrders.length === 0 ? (
                <p style={{ padding: "16px", color: "#94a3b8", fontSize: 13 }}>
                  No orders yet.
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((o) => (
                        <tr key={o._id || o.orderNumber}>
                          <td><span className="order-id">#{o.orderNumber}</span></td>
                          <td>
                            <div className="customer-cell">
                              <div className="customer-initials">{initials(o.customerName)}</div>
                              <span>{o.customerName || "Customer"}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 500 }}>{money(o.total)}</td>
                          <td>
                            <span className={`badge-status ${STATUS_CLASS[o.status] || "badge-amber"}`}>
                              {String(o.status || "new").replace(/_/g, " ")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Alerts */}
            <div className="dash-card bento-alerts">
              <div className="dash-card-header">
                <span className="dash-card-title">Alerts</span>
                {alerts.length > 0 && <div className="alert-dot" />}
              </div>
              <div className="dash-card-body alerts-card" style={{ padding: "16px 20px" }}>
                {alerts.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: 13 }}>No alerts. All systems normal.</p>
                ) : (
                  alerts.map((a) => (
                    <div key={a.link || a.message} className={`alert-item alert-${a.type || "info"}`}>
                      <p className="alert-name">{a.message}</p>
                      {a.link && (
                        <button className="alert-action" type="button" onClick={() => navigate(a.link)}>
                          View
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
