import { Link, NavLink, useLocation } from "react-router-dom";
import { useContext, useRef, useState, useEffect } from "react";
import { ShopContext } from "../context/productContext";
import { useAuthContext } from "../context/AuthContext";
import "../Styles/commerce-premium.css";

const collectionLinks = [
  { label: "All Collections", to: "/collections" },
  { label: "Kitchens", to: "/collections/kitchens" },
  { label: "Bedrooms", to: "/collections/bedrooms" },
  { label: "Outdoor", to: "/collections/outdoor" },
  { label: "Day Complements", to: "/collections/complements?type=day" },
  { label: "Night Complements", to: "/collections/complements?type=night" },
  { label: "All Products", to: "/products" },
];

export const PublicNavbar = ({ active = "" }) => {
  const shop = useContext(ShopContext);
  const { state } = useAuthContext();
  const location = useLocation();

  const cartCount = Object.values(shop?.cartItems || {}).reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0
  );

  const [collOpen, setCollOpen] = useState(false);
  const dropRef = useRef(null);
  const closeTimer = useRef(null);

  const openDrop = () => {
    clearTimeout(closeTimer.current);
    setCollOpen(true);
  };
  const closeDrop = () => {
    closeTimer.current = setTimeout(() => setCollOpen(false), 150);
  };

  useEffect(() => {
    const onMouseDown = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setCollOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setCollOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const isCollectionsActive =
    location.pathname.startsWith("/collections") || active === "Collections";

  const role = state.user?.role;
  const accountTo = state.isAuthenticated
    ? role === "admin" || role === "employee"
      ? "/admin/dashboard"
      : "/dashboard"
    : "/login";

  return (
    <header className="commerce-navbar">
      <div className="commerce-navbar-inner">
        <Link className="commerce-logo" to="/">
          Hedj Commerce
        </Link>

        <nav className="commerce-nav-links" aria-label="Primary commerce navigation">
          {/* Collections dropdown */}
          <div
            ref={dropRef}
            className="commerce-nav-dropdown"
            onMouseEnter={openDrop}
            onMouseLeave={closeDrop}
          >
            <button
              type="button"
              className={`commerce-nav-dropdown-trigger${isCollectionsActive ? " active" : ""}`}
              onClick={() => setCollOpen((p) => !p)}
              aria-expanded={collOpen}
              aria-haspopup="listbox"
            >
              Collections
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                {collOpen ? "expand_less" : "expand_more"}
              </span>
            </button>

            {collOpen && (
              <div className="commerce-dropdown-panel" role="listbox">
                {collectionLinks.map((cl) => (
                  <NavLink
                    key={cl.to}
                    to={cl.to}
                    className={({ isActive }) => (isActive ? "active" : "")}
                    role="option"
                    onClick={() => setCollOpen(false)}
                  >
                    {cl.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <NavLink
            className={({ isActive }) =>
              isActive || active === "Products" ? "active" : ""
            }
            to="/products"
          >
            Products
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive || active === "Virtual Showroom" ? "active" : ""
            }
            to="/virtual-showroom"
          >
            Virtual Showroom
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive || active === "Contact" ? "active" : ""
            }
            to="/contact"
          >
            Contact
          </NavLink>
        </nav>

        <div className="commerce-nav-actions">
          <Link aria-label="Wishlist" className="commerce-icon-link" to="/wishlist">
            <span className="material-symbols-outlined">favorite</span>
          </Link>
          <Link
            aria-label="Cart"
            className="commerce-icon-link commerce-cart-link"
            to="/cart"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            {cartCount > 0 && (
              <span className="commerce-cart-count">{cartCount}</span>
            )}
          </Link>
          <Link
            aria-label={state.isAuthenticated ? "Dashboard" : "Sign In"}
            className="commerce-icon-link"
            to={accountTo}
          >
            <span className="material-symbols-outlined">account_circle</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export const PublicFooter = () => (
  <footer className="commerce-footer">
    <div className="commerce-footer-grid">
      <div className="commerce-footer-brand-col">
        <Link to="/" className="commerce-footer-logo">
          Hedj Commerce
        </Link>
        <p>Purveyors of fine craftsmanship and considered living.</p>
      </div>

      <div className="commerce-footer-col">
        <h4>Collections</h4>
        <nav>
          <Link to="/collections">All Collections</Link>
          <Link to="/collections/kitchens">Kitchens</Link>
          <Link to="/collections/bedrooms">Bedrooms</Link>
          <Link to="/collections/outdoor">Outdoor</Link>
          <Link to="/collections/complements">Complements</Link>
        </nav>
      </div>

      <div className="commerce-footer-col">
        <h4>Discover</h4>
        <nav>
          <Link to="/products">All Products</Link>
          <Link to="/virtual-showroom">Virtual Showroom</Link>
          <Link to="/contact">Consultations</Link>
        </nav>
      </div>

      <div className="commerce-footer-col">
        <h4>Company</h4>
        <nav>
          <Link to="/contact">Contact Us</Link>
          <Link to="/sustainability">Sustainability</Link>
          <Link to="/shipping">Shipping &amp; Returns</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </nav>
      </div>
    </div>

    <div className="commerce-footer-bottom">
      <p>&copy; 2024 Hedj Commerce. All rights reserved.</p>
    </div>
  </footer>
);

export const PublicCommerceShell = ({ active, children }) => (
  <div className="commerce-page">
    <PublicNavbar active={active} />
    {children}
    <PublicFooter />
  </div>
);
