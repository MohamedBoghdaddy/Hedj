import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../context/AuthContext";
import { can, isAdmin } from "../utils/permissions";
import "../Styles/admin-premium.css";

// Sidebar nav definition: each item declares which permission is required.
// Items with requireAdmin=true are only shown to admin/super_admin.
const NAV_ITEMS = [
  { label: "Overview",         icon: "dashboard",       href: "/admin/dashboard",     permission: null },
  { label: "Orders",           icon: "shopping_cart",   href: "/admin/orders",        permission: "orders.viewAll" },
  { label: "Products",         icon: "chair",           href: "/admin/products",      permission: "products.view" },
  { label: "Customers",        icon: "groups",          href: "/admin/customers",     permission: "customers.view" },
  { label: "Employees",        icon: "badge",           href: "/admin/employees",     permission: "employees.view" },
  { label: "Leads",            icon: "leaderboard",     href: "/admin/leads",         permission: "leads.view" },
  { label: "Quotes",           icon: "request_quote",   href: "/admin/quotes",        permission: "quotes.view" },
  { label: "Attendance",       icon: "event_available", href: "/admin/attendance",    permission: "attendance.viewAll" },
  { label: "Leave Requests",   icon: "beach_access",    href: "/admin/leave",         permission: "leave.viewAll" },
  { label: "Email Outbox",     icon: "outgoing_mail",   href: "/admin/emails",        permission: "emails.view" },
  { label: "ERP Architecture", icon: "account_tree",    href: "/admin/erp/overview",  permission: "erp.view" },
  { label: "Analytics",        icon: "bar_chart",       href: "/admin/analytics",     permission: "analytics.view" },
  { label: "Reports",          icon: "analytics",       href: "/admin/reports",       permission: "reports.view" },
  { label: "Settings",         icon: "settings",        href: "/admin/settings",      requireAdmin: true },
];

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  HR: "HR",
  accountant: "Accountant",
  operations: "Operations",
  designer: "Designer",
  employee: "Employee",
};

export const AdminSidebar = ({ active = "Overview" }) => {
  const navigate = useNavigate();
  const { logout } = useLogout();
  const { state } = useAuthContext();
  const user = state.user;
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await logout();
    navigate("/Login", { replace: true });
  };

  // Filter nav items based on current user's permissions
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.requireAdmin) return isAdmin(user);
    if (item.permission)   return can(user, item.permission);
    return true; // Overview always visible for authenticated staff
  });

  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Staff"
    : "Staff";

  const roleLabel = user ? (ROLE_LABELS[user.role] || user.role || "Staff") : "Staff";

  const avatarUrl = user?.profilePhotoUrl || null;

  return (
    <aside className="admin-premium-sidebar">
      <div className="admin-premium-brand">
        <h1>Hedj OS</h1>
        <p>{roleLabel} Console</p>
      </div>

      <nav className="admin-premium-nav" aria-label="Admin navigation">
        {visibleItems.map(({ label, icon, href }) => (
          <NavLink
            key={label}
            to={href}
            className={({ isActive }) =>
              `admin-premium-nav-link ${isActive || active === label ? "active" : ""}`
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-premium-sidebar-footer">
        <div className="admin-premium-profile">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`${displayName} profile`} />
          ) : (
            <div
              className="admin-premium-profile-initials"
              aria-label={`${displayName} avatar`}
            >
              {displayName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
            </div>
          )}
          <div>
            <strong>{displayName}</strong>
            <span>{roleLabel}</span>
          </div>
        </div>
        <div className="admin-premium-profile-divider" />
        <button
          type="button"
          className="admin-premium-logout"
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label="Logout"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>{loggingOut ? "Signing Out…" : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
};

export const AdminFooter = () => (
  <footer className="admin-premium-footer">
    <div>
      <p>&copy; 2025 Hedj Commerce OS. All rights reserved.</p>
      <nav aria-label="Admin footer links">
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms of Service</Link>
        <Link to="/shipping">Shipping &amp; Returns</Link>
        <Link to="/sustainability">Sustainability</Link>
      </nav>
    </div>
  </footer>
);

export const AdminShell = ({ active, title, subtitle, actions, children }) => (
  <div className="admin-premium-page">
    <AdminSidebar active={active} />
    <main className="admin-premium-main">
      <header className="admin-premium-topbar">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actions && <div className="admin-premium-actions">{actions}</div>}
      </header>
      <div className="admin-premium-content">{children}</div>
      <AdminFooter />
    </main>
  </div>
);
