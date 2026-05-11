import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { useLogout } from "../../hooks/useLogout.js";
import { ShopContext } from "../../context/productContext";
import { useContext } from "react";
import "../../Styles/navbar-premium.css";

const NAV_LINKS = [
  { label: "Collections", path: "/collections" },
  { label: "Products",    path: "/products" },
  { label: "Showroom",    path: "/contact" },
  { label: "Contact",     path: "/contact" },
];

const COLLECTION_LINKS = [
  { label: "Kitchens",         path: "/Kitchen" },
  { label: "Bedrooms",         path: "/Bedroom" },
  { label: "Outdoor",          path: "/Outdoor" },
  { label: "Day Complements",  path: "/DayComplement" },
  { label: "Night Complements",path: "/NightComplement" },
];

const NavBar = () => {
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [collectionsOpen, setCollOpen]  = useState(false);
  const { state }   = useAuthContext();
  const { user, isAuthenticated } = state;
  const { logout }  = useLogout();
  const navigate    = useNavigate();
  const location    = useLocation();
  const { cartItems } = useContext(ShopContext);

  const cartCount = Object.values(cartItems || {}).reduce(
    (sum, item) => sum + (item.quantity || 0), 0
  );

  const handleLogout = () => { logout(); navigate("/"); };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <nav className="hedj-navbar">
      <div className="nav-inner">

        {/* Brand */}
        <Link to="/" className="nav-brand">Hedj Commerce</Link>

        {/* Desktop nav links */}
        <ul className={`nav-links${mobileOpen ? " open" : ""}`}>
          {/* Collections dropdown */}
          <li
            className={`nav-dropdown${collectionsOpen ? " open" : ""}`}
            onMouseEnter={() => setCollOpen(true)}
            onMouseLeave={() => setCollOpen(false)}
          >
            <a
              href="#collections"
              className={isActive("/collections") || isActive("/Kitchen") ? "active" : ""}
              onClick={(e) => { e.preventDefault(); setCollOpen(!collectionsOpen); }}
            >
              Collections
            </a>
            <div className="nav-dropdown-menu">
              {COLLECTION_LINKS.map(({ label, path }) => (
                <Link key={path} to={path} onClick={() => { setMobileOpen(false); setCollOpen(false); }}>
                  {label}
                </Link>
              ))}
            </div>
          </li>

          <li>
            <Link
              to="/products"
              className={isActive("/products") ? "active" : ""}
              onClick={() => setMobileOpen(false)}
            >Products</Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={isActive("/contact") ? "active" : ""}
              onClick={() => setMobileOpen(false)}
            >Virtual Showroom</Link>
          </li>
          <li>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
            >Contact</Link>
          </li>

          {/* Dashboard link for admins */}
          {isAuthenticated && user && (
            <li>
              <Link
                to="/dashboard"
                className={isActive("/dashboard") || isActive("/admin") ? "active" : ""}
                onClick={() => setMobileOpen(false)}
              >Dashboard</Link>
            </li>
          )}
        </ul>

        {/* Actions */}
        <div className="nav-actions">
          <Link to="/wishlist" className="nav-icon-btn" title="Wishlist">
            <span className="material-symbols-outlined">favorite</span>
          </Link>

          <Link to="/cart" className="nav-icon-btn" title="Cart">
            <span className="material-symbols-outlined">shopping_bag</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {isAuthenticated && user ? (
            <button className="nav-icon-btn nav-user-pill" onClick={handleLogout} title="Logout">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          ) : (
            <Link to="/Login" className="nav-icon-btn" title="Login">
              <span className="material-symbols-outlined">account_circle</span>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="nav-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            <span style={{ transform: mobileOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
            <span style={{ opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ transform: mobileOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
          </button>
        </div>

      </div>
    </nav>
  );
};

export default NavBar;
