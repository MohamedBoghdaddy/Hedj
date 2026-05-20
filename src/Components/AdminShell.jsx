import { useState, useEffect, useCallback } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../context/AuthContext";
import { can, isAdmin, getDashboardRoute } from "../utils/permissions";
import "../Styles/admin-premium.css";

// Admin/manager items — require viewAll-level permissions
const ADMIN_NAV_ITEMS = [
  { label: "Orders",           icon: "shopping_cart",   href: "/admin/orders",       permission: "orders.viewAll" },
  { label: "Products",         icon: "chair",           href: "/admin/products",     permission: "products.view" },
  { label: "Customers",        icon: "groups",          href: "/admin/customers",    permission: "customers.view" },
  { label: "Employees",        icon: "badge",           href: "/admin/employees",    permission: "employees.view" },
  { label: "Leads",            icon: "leaderboard",     href: "/admin/leads",        permission: "leads.view" },
  { label: "Quotes",           icon: "request_quote",   href: "/admin/quotes",       permission: "quotes.view" },
  { label: "Attendance",       icon: "event_available", href: "/admin/attendance",   permission: "attendance.viewAll" },
  { label: "Leave Requests",   icon: "beach_access",    href: "/admin/leave",        permission: "leave.viewAll" },
  { label: "Email Outbox",     icon: "outgoing_mail",   href: "/admin/emails",       permission: "emails.view" },
  { label: "ERP Architecture", icon: "account_tree",    href: "/admin/erp/overview", permission: "erp.view" },
  { label: "Analytics",        icon: "bar_chart",       href: "/admin/analytics",    permission: "analytics.view" },
  { label: "Reports",          icon: "analytics",       href: "/admin/reports",      permission: "reports.view" },
  { label: "Settings",         icon: "settings",        href: "/admin/settings",     requireAdmin: true },
];

// Employee self-service items — visible when user only has viewOwn (not viewAll)
const EMPLOYEE_NAV_ITEMS = [
  { label: "My Attendance",    icon: "event_available", href: "/employee/attendance",     permission: "attendance.viewOwn",  excludeIfHas: "attendance.viewAll" },
  { label: "My Leave",         icon: "beach_access",    href: "/employee/leave-requests", permission: "leave.viewOwn",       excludeIfHas: "leave.viewAll" },
];

const ROLE_LABELS = {
  super_admin: "Super Admin", admin: "Admin", manager: "Manager",
  HR: "HR", accountant: "Accountant", operations: "Operations",
  designer: "Designer", employee: "Employee",
};

/** Shared nav content used by both the desktop sidebar and mobile drawer */
const AdminNav = ({ active, user, onNavigate }) => {
  const overviewHref = getDashboardRoute(user);

  const visibleAdminItems = ADMIN_NAV_ITEMS.filter(item =>
    item.requireAdmin ? isAdmin(user) : (item.permission ? can(user, item.permission) : true)
  );

  const visibleEmployeeItems = EMPLOYEE_NAV_ITEMS.filter(item =>
    can(user, item.permission) && !can(user, item.excludeIfHas)
  );

  const allItems = [
    { label: "Overview", icon: "dashboard", href: overviewHref, permission: null },
    ...visibleAdminItems,
    ...visibleEmployeeItems,
  ];

  return (
    <nav className="admin-premium-nav" aria-label="Admin navigation">
      {allItems.map(({ label, icon, href }) => (
        <NavLink
          key={label}
          to={href}
          onClick={onNavigate}
          className={({ isActive }) =>
            `admin-premium-nav-link${isActive || active === label ? " active" : ""}`
          }
        >
          <span className="material-symbols-outlined">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

/** Shared profile + logout footer used by sidebar and drawer */
const AdminProfileFooter = ({ user, onLogout, loggingOut }) => {
  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Staff"
    : "Staff";
  const roleLabel = user ? (ROLE_LABELS[user.role] || user.role || "Staff") : "Staff";
  const avatarUrl = user?.profilePhotoUrl || null;

  return (
    <div className="admin-premium-sidebar-footer">
      <div className="admin-premium-profile">
        {avatarUrl ? (
          <img src={avatarUrl} alt={`${displayName} profile`} />
        ) : (
          <div className="admin-premium-profile-initials" aria-label={`${displayName} avatar`}>
            {displayName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
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
        onClick={onLogout}
        disabled={loggingOut}
        aria-label="Logout"
      >
        <span className="material-symbols-outlined">logout</span>
        <span>{loggingOut ? "Signing Out…" : "Logout"}</span>
      </button>
    </div>
  );
};

export const AdminSidebar = ({ active = "Overview" }) => {
  const navigate = useNavigate();
  const { logout } = useLogout();
  const { state } = useAuthContext();
  const user = state.user;
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  // Close drawer on Escape key
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleLogout = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await logout();
    navigate("/Login", { replace: true });
  }, [loggingOut, logout, navigate]);

  const roleLabel = user ? (ROLE_LABELS[user.role] || user.role || "Staff") : "Staff";

  return (
    <>
      {/* ── Desktop sidebar (hidden ≤1024px) ─────────────────────────────── */}
      <aside className="admin-premium-sidebar">
        <div className="admin-premium-brand">
          <h1>Hedj OS</h1>
          <p>{roleLabel} Console</p>
        </div>
        <AdminNav active={active} user={user} />
        <AdminProfileFooter user={user} onLogout={handleLogout} loggingOut={loggingOut} />
      </aside>

      {/* ── Mobile top bar (visible ≤1024px) ─────────────────────────────── */}
      <div className="admin-mobile-topbar" aria-label="Mobile admin navigation">
        <button
          type="button"
          className="admin-mobile-hamburger"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="admin-mobile-brand">Hedj OS</span>
        <button
          type="button"
          className="admin-mobile-logout-btn"
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label="Logout"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>

      {/* ── Mobile drawer overlay ─────────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="admin-drawer-overlay"
          role="button"
          tabIndex={-1}
          aria-label="Close navigation menu"
          onClick={() => setDrawerOpen(false)}
          onKeyDown={(e) => e.key === "Enter" && setDrawerOpen(false)}
        />
      )}

      <aside
        className={`admin-drawer${drawerOpen ? " admin-drawer--open" : ""}`}
        aria-hidden={!drawerOpen}
        aria-label="Mobile navigation drawer"
      >
        <div className="admin-drawer-header">
          <div className="admin-premium-brand" style={{ padding: "0 0 12px" }}>
            <h1>Hedj OS</h1>
            <p>{roleLabel} Console</p>
          </div>
          <button
            type="button"
            className="admin-drawer-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <AdminNav active={active} user={user} onNavigate={() => setDrawerOpen(false)} />
        <AdminProfileFooter user={user} onLogout={handleLogout} loggingOut={loggingOut} />
      </aside>
    </>
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
