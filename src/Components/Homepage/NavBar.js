import { useContext, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { ShopContext } from "../../context/productContext";
import "./homepage-premium.css";

const collectionLinks = [
  { label: "Kitchens", path: "/collections/kitchens" },
  { label: "Bedrooms", path: "/collections/bedrooms" },
  { label: "Outdoor", path: "/collections/outdoor" },
  { label: "Complements", path: "/collections/complements" },
];

const navLinks = [
  { label: "Products", path: "/products" },
  { label: "Virtual Showroom", path: "/virtual-showroom" },
  { label: "Contact", path: "/contact" },
];

const NavBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const { state } = useAuthContext();
  const { cartItems } = useContext(ShopContext);
  const location = useLocation();
  const isAuthenticated = state.isAuthenticated && state.user;

  const cartCount = Object.values(cartItems || {}).reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );
  const collectionsActive = location.pathname.startsWith("/collections");
  const closeMenus = () => {
    setMobileOpen(false);
    setCollectionsOpen(false);
  };

  return (
    <header className="hedj-home-nav">
      <div className="hedj-home-nav-inner">
        <Link to="/" className="hedj-home-brand" onClick={closeMenus}>
          Hedj Commerce
        </Link>

        <nav className={`hedj-home-links${mobileOpen ? " is-open" : ""}`} aria-label="Primary navigation">
          <div
            className={`hedj-home-dropdown${collectionsOpen ? " is-open" : ""}`}
            onMouseEnter={() => setCollectionsOpen(true)}
            onMouseLeave={() => setCollectionsOpen(false)}
          >
            <NavLink
              to="/collections"
              className={collectionsActive ? "active" : undefined}
              onClick={closeMenus}
            >
              Collections
            </NavLink>
            <div className="hedj-home-dropdown-menu" aria-label="Collection links">
              {collectionLinks.map((link) => (
                <NavLink to={link.path} key={link.path} onClick={closeMenus}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          {navLinks.map((link) => (
            <NavLink to={link.path} key={link.path} onClick={closeMenus}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hedj-home-actions">
          <Link to="/wishlist" className="hedj-home-icon-btn" aria-label="Wishlist">
            <span className="material-symbols-outlined">favorite</span>
          </Link>
          <Link to="/cart" className="hedj-home-icon-btn" aria-label="Cart">
            <span className="material-symbols-outlined">shopping_bag</span>
            {cartCount > 0 && <span className="hedj-home-cart-badge">{cartCount}</span>}
          </Link>
          <Link
            to={isAuthenticated ? "/dashboard" : "/Login"}
            className="hedj-home-icon-btn"
            aria-label={isAuthenticated ? "Account dashboard" : "Login"}
          >
            <span className="material-symbols-outlined">account_circle</span>
          </Link>
          <button
            type="button"
            className="hedj-home-menu-btn"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
