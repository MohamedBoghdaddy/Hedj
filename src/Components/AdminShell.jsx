import { Link, NavLink } from "react-router-dom";
import "../Styles/admin-premium.css";

const adminAvatar =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBhUMsZ0tH6pnfDWGMVLGVs8-O5mA6xcdigx1FJ0T0tneXrOqmfmdc78lmc_-IQmYBShnYSzPD3gLy9wkAu8zSO1eRRbsHH8xsJ8sdZxhdMkGRq20revcBZzbgulgZ8bzX7sPQCsi07Wd5EcMaCFRVgrOfUFOm-xgUlkmFDvnYscf1-wXbw-yZ1YA8B0E6t0pQ0fo9UQ_91c5-83WMkh1dV4f53ymxqv40BnUkuK3sNQxQo4CJUsa875jl-miAWQ8XU0rMzpexbtTZi";

const navItems = [
  ["Overview", "dashboard", "/admin/dashboard"],
  ["Orders", "shopping_cart", "/admin/orders"],
  ["Products", "chair", "/admin/products"],
  ["Inventory", "inventory_2", "/admin/inventory"],
  ["Customers", "groups", "/admin/customers"],
  ["Employees", "badge", "/admin/employees"],
  ["Leads", "leaderboard", "/admin/leads"],
  ["Quotes", "request_quote", "/admin/quotes"],
  ["Showroom", "event_seat", "/admin/showroom"],
  ["ERP Architecture", "account_tree", "/admin/erp"],
  ["Reports", "analytics", "/admin/analytics"],
  ["Settings", "settings", "/admin/settings"],
];

export const AdminSidebar = ({ active = "Overview", profileName = "Julianne Vose", role = "Admin Console" }) => (
  <aside className="admin-premium-sidebar">
    <div className="admin-premium-brand">
      <h1>Hedj OS</h1>
      <p>Admin Console</p>
    </div>

    <nav className="admin-premium-nav" aria-label="Admin navigation">
      {navItems.map(([label, icon, href]) => (
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

    <div className="admin-premium-profile">
      <img src={adminAvatar} alt="Admin profile" />
      <div>
        <strong>{profileName}</strong>
        <span>{role}</span>
      </div>
    </div>
  </aside>
);

export const AdminFooter = () => (
  <footer className="admin-premium-footer">
    <div>
      <p>(c) 2024 Hedj Commerce OS. All rights reserved.</p>
      <nav aria-label="Admin footer links">
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms of Service</Link>
        <Link to="/shipping">Shipping & Returns</Link>
        <Link to="/sustainability">Sustainability</Link>
      </nav>
    </div>
  </footer>
);

export const AdminShell = ({
  active,
  title,
  subtitle,
  actions,
  children,
  profileName = "Julianne Vose",
  role = "Head of Logistics",
}) => (
  <div className="admin-premium-page">
    <AdminSidebar active={active} profileName={profileName} role={role} />
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
