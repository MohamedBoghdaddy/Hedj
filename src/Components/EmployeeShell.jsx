import { useState, useEffect, useCallback } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../context/AuthContext";
import "../Styles/admin-premium.css";

const EMPLOYEE_NAV = [
  { label: "Overview",       icon: "dashboard",       href: "/employee/dashboard" },
  { label: "My Attendance",  icon: "event_available", href: "/employee/attendance" },
  { label: "Leave Requests", icon: "beach_access",    href: "/employee/leave-requests" },
  { label: "Support",        icon: "help_center",     href: "/support" },
];

const EmployeeNav = ({ active, onNavigate }) => (
  <nav className="admin-premium-nav" aria-label="Employee navigation">
    {EMPLOYEE_NAV.map(({ label, icon, href }) => (
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

const EmployeeProfileFooter = ({ user, onLogout, loggingOut }) => {
  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Employee"
    : "Employee";
  const avatarUrl = user?.profilePhotoUrl || null;

  return (
    <div className="admin-premium-sidebar-footer">
      <div className="admin-premium-profile">
        {avatarUrl ? (
          <img src={avatarUrl} alt={`${displayName} profile`} />
        ) : (
          <div className="admin-premium-profile-initials" aria-label={`${displayName} avatar`}>
            {displayName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
          </div>
        )}
        <div>
          <strong>{displayName}</strong>
          <span>Employee</span>
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

export const EmployeeSidebar = ({ active = "Overview" }) => {
  const navigate = useNavigate();
  const { logout } = useLogout();
  const { state } = useAuthContext();
  const user = state.user;
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

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

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <aside className="admin-premium-sidebar">
        <div className="admin-premium-brand">
          <h1>Hedj OS</h1>
          <p>Employee Console</p>
        </div>
        <EmployeeNav active={active} />
        <EmployeeProfileFooter user={user} onLogout={handleLogout} loggingOut={loggingOut} />
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────────────────────── */}
      <div className="admin-mobile-topbar" aria-label="Mobile employee navigation">
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

      {/* ── Mobile drawer overlay ────────────────────────────────────────────── */}
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
            <p>Employee Console</p>
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
        <EmployeeNav active={active} onNavigate={() => setDrawerOpen(false)} />
        <EmployeeProfileFooter user={user} onLogout={handleLogout} loggingOut={loggingOut} />
      </aside>
    </>
  );
};

export const EmployeeFooter = () => (
  <footer className="admin-premium-footer">
    <div>
      <p>&copy; 2025 Hedj Commerce OS. All rights reserved.</p>
      <nav aria-label="Footer links">
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms of Service</Link>
        <Link to="/support">Support</Link>
      </nav>
    </div>
  </footer>
);

export const EmployeeShell = ({ active, title, subtitle, actions, children }) => (
  <div className="admin-premium-page">
    <EmployeeSidebar active={active} />
    <main className="admin-premium-main">
      <header className="admin-premium-topbar">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actions && <div className="admin-premium-actions">{actions}</div>}
      </header>
      <div className="admin-premium-content">{children}</div>
      <EmployeeFooter />
    </main>
  </div>
);
