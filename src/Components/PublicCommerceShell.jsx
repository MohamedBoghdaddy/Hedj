import { Link, NavLink } from "react-router-dom";
import { useContext } from "react";
import { ShopContext } from "../context/productContext";
import { useAuthContext } from "../context/AuthContext";
import "../Styles/commerce-premium.css";

export const PublicNavbar = ({ active = "" }) => {
  const shop = useContext(ShopContext);
  const { state } = useAuthContext();
  const cartCount = Object.values(shop?.cartItems || {}).reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0
  );

  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <header className="commerce-navbar">
      <div className="commerce-navbar-inner">
        <Link className="commerce-logo" to="/">
          Hedj Commerce
        </Link>

        <nav className="commerce-nav-links" aria-label="Primary commerce navigation">
          <NavLink
            className={({ isActive }) =>
              isActive || active === "Collections" ? "active" : ""
            }
            to="/collections/kitchens"
          >
            Collections
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive || active === "Products" ? "active" : ""
            }
            to="/products"
          >
            Products
          </NavLink>
          <NavLink className={linkClass} to="/contact">
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
          <Link aria-label="Cart" className="commerce-icon-link commerce-cart-link" to="/cart">
            <span className="material-symbols-outlined">shopping_bag</span>
            {cartCount > 0 && <span className="commerce-cart-count">{cartCount}</span>}
          </Link>
          <Link
            aria-label={state.isAuthenticated ? "Dashboard" : "Account"}
            className="commerce-icon-link"
            to={state.isAuthenticated ? "/admin/dashboard" : "/Login"}
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
    <div className="commerce-footer-inner">
      <p>(c) 2024 Hedj Commerce OS. All rights reserved.</p>
      <div className="commerce-footer-links">
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms of Service</Link>
        <Link to="/shipping">Shipping & Returns</Link>
        <Link to="/sustainability">Sustainability</Link>
      </div>
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
