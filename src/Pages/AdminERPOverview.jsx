import { useEffect, useState } from "react";
import { AdminShell } from "../Components/AdminShell";
import { erpApi } from "../services/api";
import "../Styles/admin-erp-premium.css";

const layers = [
  {
    key: "primary",
    label: "Core / Primary Layer",
    desc: "Foundation modules — other apps depend on these",
    apps: [
      { name: "Base / Users", icon: "manage_accounts", status: "active" },
      { name: "Companies", icon: "business", status: "planned" },
      { name: "Contacts", icon: "contacts", status: "active" },
      { name: "Employees", icon: "badge", status: "static" },
      { name: "Products", icon: "chair", status: "active" },
      { name: "Accounting", icon: "account_balance", status: "planned" },
      { name: "Inventory", icon: "inventory_2", status: "static" },
    ],
  },
  {
    key: "org",
    label: "Organization Layer",
    desc: "People, departments, job positions, and approval chains",
    apps: [
      { name: "Departments", icon: "corporate_fare", status: "static" },
      { name: "Job Positions", icon: "work", status: "static" },
      { name: "Roles & Permissions", icon: "admin_panel_settings", status: "active" },
      { name: "Approval Workflow", icon: "approval", status: "static" },
    ],
  },
  {
    key: "secondary",
    label: "Operational / Secondary Layer",
    desc: "Day-to-day workflows that depend on the core layer",
    apps: [
      { name: "Sales", icon: "point_of_sale", status: "static" },
      { name: "Purchase", icon: "shopping_cart", status: "planned" },
      { name: "CRM", icon: "leaderboard", status: "static" },
      { name: "Orders", icon: "receipt_long", status: "static" },
      { name: "HR", icon: "groups", status: "planned" },
      { name: "Projects", icon: "task_alt", status: "planned" },
      { name: "Fulfillment", icon: "local_shipping", status: "planned" },
      { name: "Manufacturing", icon: "precision_manufacturing", status: "planned" },
    ],
  },
  {
    key: "optional",
    label: "Extension / Optional Layer",
    desc: "Feature modules that enhance but do not block core workflows",
    apps: [
      { name: "Website / eCommerce", icon: "storefront", status: "active" },
      { name: "Virtual Showroom", icon: "event_seat", status: "active" },
      { name: "Marketing", icon: "campaign", status: "planned" },
      { name: "Helpdesk", icon: "support_agent", status: "planned" },
      { name: "POS", icon: "storefront", status: "planned" },
      { name: "Consultations", icon: "calendar_month", status: "planned" },
    ],
  },
];

const recentActivity = [
  { text: "Leave request from Priya Mehta awaiting approval from Eleanor Vance.", time: "2 hours ago", tone: "pending" },
  { text: "Purchase approval submitted by Marcus Thorne — $12,400 warehouse equipment.", time: "5 hours ago", tone: "pending" },
  { text: "Module access request from Omar Hassan approved by James Knight.", time: "Yesterday", tone: "approved" },
  { text: "Lena Park leave request approved by Julianne Vose.", time: "2 days ago", tone: "approved" },
  { text: "Expense claim from David Harrington rejected — $840 client entertainment.", time: "3 days ago", tone: "rejected" },
];

const integrations = [
  { name: "Auth / Users", status: "active", icon: "check_circle" },
  { name: "Products API", status: "active", icon: "check_circle" },
  { name: "eCommerce Frontend", status: "active", icon: "check_circle" },
  { name: "Orders Pipeline", status: "static", icon: "info" },
  { name: "CRM / Leads", status: "static", icon: "info" },
  { name: "Inventory Tracking", status: "static", icon: "info" },
  { name: "Accounting", status: "planned", icon: "schedule" },
  { name: "Manufacturing", status: "planned", icon: "schedule" },
];

export default function AdminERPOverview() {
  const [overview, setOverview] = useState(null);
  const [liveIntegrations, setLiveIntegrations] = useState(integrations);
  const [error, setError] = useState("");
  const primaryCount = 7;
  const secondaryCount = 8;
  const optionalCount = 6;

  useEffect(() => {
    erpApi
      .getOverview()
      .then((payload) => {
        setOverview(payload.overview);
        if (payload.overview?.integrations) {
          setLiveIntegrations(payload.overview.integrations);
        }
        setError("");
      })
      .catch((err) => setError(err.message || "ERP overview could not be loaded."));
  }, []);

  return (
    <AdminShell
      active="ERP Architecture"
      title="ERP Architecture"
      subtitle="Application dependencies, schema relationships, and organizational structure"
    >
      {error && <div className="admin-toast admin-toast--warn">{error}</div>}
      {/* KPI Row */}
      <div className="erp-kpi-row">
        {[
          { label: "Primary Apps", value: primaryCount, icon: "layers", sub: "Foundation layer" },
          { label: "Secondary Apps", value: secondaryCount, icon: "account_tree", sub: "Operational layer" },
          { label: "Optional Apps", value: optionalCount, icon: "extension", sub: "Extension layer" },
          { label: "Employees", value: overview?.employees ?? 15, icon: "badge", sub: "Org hierarchy" },
          { label: "Departments", value: overview?.departments ?? 8, icon: "corporate_fare", sub: "Active units" },
          { label: "Pending Approvals", value: overview?.pendingApprovals ?? 3, icon: "pending_actions", sub: "Requires action" },
        ].map((kpi) => (
          <div className="erp-kpi-card" key={kpi.label}>
            <div className="erp-kpi-icon">
              <span className="material-symbols-outlined">{kpi.icon}</span>
            </div>
            <div className="erp-kpi-label">{kpi.label}</div>
            <div className="erp-kpi-value">{kpi.value}</div>
            <div className="erp-kpi-sub">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Architecture Map */}
      <div className="erp-arch-section">
        <h2>Architecture Map</h2>
        <div className="erp-layer-row">
          {layers.map((layer) => (
            <div className="erp-layer-card" key={layer.key}>
              <div className={`erp-layer-header ${layer.key}`}>
                <div>
                  <h3>{layer.label}</h3>
                  <p>{layer.desc}</p>
                </div>
              </div>
              <div className="erp-layer-apps">
                {layer.apps.map((app) => (
                  <span className={`erp-app-chip status-${app.status}`} key={app.name}>
                    <span className="material-symbols-outlined">{app.icon}</span>
                    {app.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Recent Activity */}
        <div className="erp-section-card">
          <h2>Recent Workflow Activity</h2>
          <div className="erp-activity-feed">
            {recentActivity.map((item, i) => (
              <div className="erp-activity-item" key={i}>
                <div className={`erp-activity-dot ${item.tone}`} />
                <div>
                  <div className="erp-activity-text">{item.text}</div>
                  <div className="erp-activity-time">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Status */}
        <div className="erp-section-card">
          <h2>Integration Status</h2>
          <div className="erp-activity-feed">
            {liveIntegrations.map((item) => (
              <div className="erp-activity-item" key={item.name} style={{ alignItems: "center" }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 16,
                    color: item.status === "active" ? "#059669" : item.status === "static" ? "#d97706" : "#c6c6cd",
                  }}
                >
                  {item.icon || (item.status === "active" ? "check_circle" : "info")}
                </span>
                <div>
                  <div className="erp-activity-text">{item.name}</div>
                  <div className="erp-activity-time" style={{ textTransform: "capitalize" }}>{item.message || item.status}</div>
                </div>
                <span
                  className={`erp-badge erp-badge-${item.status === "api-connected" ? "api" : item.status}`}
                  style={{ marginLeft: "auto" }}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
