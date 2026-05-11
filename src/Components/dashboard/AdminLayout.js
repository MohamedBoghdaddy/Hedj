import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { useLogout } from "../../hooks/useLogout.js";
import "../../Styles/admin-layout.css";

const NAV = [
  { icon: "dashboard",      label: "Overview",   path: "/dashboard" },
  { icon: "shopping_cart",  label: "Orders",     path: "/admin/orders" },
  { icon: "chair",          label: "Products",   path: "/admin/products" },
  { icon: "inventory_2",    label: "Inventory",  path: "/admin/products" },
  { icon: "groups",         label: "Customers",  path: "/admin/customers" },
  { icon: "badge",          label: "Employees",  path: "/admin/employees" },
  { icon: "leaderboard",    label: "Leads",      path: "/admin/leads" },
  { icon: "request_quote",  label: "Quotes",     path: "/admin/leads" },
  { icon: "analytics",      label: "Analytics",  path: "/admin/analytics" },
  { icon: "event_seat",     label: "Showroom",   path: "/contact" },
  { icon: "settings",       label: "Settings",   path: "/admin/settings" },
];

const AdminLayout = ({ children }) => {
  const location   = useLocation();
  const navigate   = useNavigate();
  const { state }  = useAuthContext();
  const { user, isAuthenticated } = state;
  const { logout } = useLogout();
  const [search, setSearch] = useState("");

  const handleLogout = () => { logout(); navigate("/"); };

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/dashboard" && location.pathname.startsWith(path));

  return (
    <div className="admin-shell">

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="brand-name">Hedj OS</div>
          <div className="brand-sub">Admin Console</div>
        </div>

        <nav className="admin-nav">
          {NAV.map(({ icon, label, path }) => (
            <Link
              key={label}
              to={path}
              className={`admin-nav-item${isActive(path) ? " active" : ""}`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-row">
            <div className="admin-avatar">
              {user?.profilePhoto ? (
                <img src={`http://localhost:8000${user.profilePhoto}`} alt="Admin" />
              ) : (
                <span className="material-symbols-outlined">account_circle</span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="admin-user-name">{user?.username || "Admin"}</p>
              <p className="admin-user-role">{user?.role || "Administrator"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="admin-content">

        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-search">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              placeholder="Search orders, clients, or products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-topbar-actions">
            <button className="admin-topbar-btn">
              <span className="material-symbols-outlined">notifications</span>
              <span className="admin-notif-badge">3</span>
            </button>
            <button className="admin-topbar-btn">
              <span className="material-symbols-outlined">favorite</span>
            </button>
            <Link to="/cart" className="admin-topbar-btn">
              <span className="material-symbols-outlined">shopping_bag</span>
            </Link>
            <div className="admin-topbar-divider" />
            <div className="admin-topbar-brand" onClick={handleLogout}>
              <span className="material-symbols-outlined">account_circle</span>
              <span>Hedj Commerce</span>
            </div>
          </div>
        </header>

        {/* Page */}
        <div className="admin-page-body">
          {children}
        </div>
      </div>

      {/* FAB */}
      <button className="admin-fab" title="Quick action">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
};

export default AdminLayout;
