import { Link, NavLink, useLocation } from "react-router-dom";
import { useContext, useRef, useState, useEffect } from "react";
import { ShopContext } from "../context/productContext";
import { useAuthContext } from "../context/AuthContext";
import { getDashboardRoute } from "../utils/permissions";
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
  const wishlistCount = Array.isArray(shop?.wishlistItems)
    ? shop.wishlistItems.length
    : 0;

  const [collOpen, setCollOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropRef = useRef(null);
  const closeTimer = useRef(null);

  const openDrop = () => {
    clearTimeout(closeTimer.current);
    setCollOpen(true);
  };
  const closeDrop = () => {
    closeTimer.current = setTimeout(() => setCollOpen(false), 150);
  };

  // Close all menus on route change
  useEffect(() => {
    setCollOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onMouseDown = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setCollOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setCollOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const isCollectionsActive =
    location.pathname.startsWith("/collections") || active === "Collections";

  const accountTo = state.isAuthenticated
    ? getDashboardRoute(state.user)
    : "/login";

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="commerce-navbar">
        <div className="commerce-navbar-inner">
          <Link className="commerce-logo" to="/">
            Hedj Commerce
          </Link>

          {/* Desktop nav — hidden below 768px via CSS */}
          <nav className="commerce-nav-links" aria-label="Primary commerce navigation">
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
              {wishlistCount > 0 && (
                <span className="commerce-cart-count">{wishlistCount}</span>
              )}
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

            {/* Hamburger — visible only on mobile (<768px) */}
            <button
              type="button"
              className="commerce-mobile-menu-btn"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <span className="material-symbols-outlined">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="commerce-mobile-overlay"
          role="button"
          tabIndex={-1}
          aria-label="Close menu"
          onClick={closeMobile}
          onKeyDown={(e) => e.key === "Enter" && closeMobile()}
        />
      )}

      {/* Mobile slide-down drawer */}
      <nav
        className={`commerce-mobile-drawer${mobileMenuOpen ? " open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileMenuOpen}
      >
        <div className="commerce-mobile-nav">
          <p className="commerce-mobile-nav-section">Collections</p>
          {collectionLinks.map((cl) => (
            <Link key={cl.to} to={cl.to} onClick={closeMobile}>
              {cl.label}
            </Link>
          ))}
          <p className="commerce-mobile-nav-section">Discover</p>
          <Link to="/products" onClick={closeMobile}>All Products</Link>
          <Link to="/virtual-showroom" onClick={closeMobile}>Virtual Showroom</Link>
          <Link to="/contact" onClick={closeMobile}>Contact</Link>
          <p className="commerce-mobile-nav-section">Account</p>
          <Link to={accountTo} onClick={closeMobile}>
            {state.isAuthenticated ? "My Account" : "Sign In"}
          </Link>
        </div>
      </nav>
    </>
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
