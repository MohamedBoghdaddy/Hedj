import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import "../../Styles/Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setEmail(""); alert("Thank you for subscribing!"); }
  };

  return (
    <footer className="hedj-footer">
      {/* Newsletter band */}
      <div className="footer-newsletter">
        <div className="footer-nl-inner">
          <div>
            <h3 className="footer-nl-heading">Join the Collective</h3>
            <p className="footer-nl-sub">
              Receive early access to seasonal collections and interior design insights from our founders.
            </p>
          </div>
          <form className="footer-nl-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="footer-main">
        <div className="footer-main-inner">
          {/* Brand */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo">Hedj Commerce</Link>
            <p className="footer-brand-desc">
              Discover elegance and comfort with Hedj, your trusted partner in premium furniture.
              Each piece crafted to elevate your space with intentional luxury.
            </p>
            <div className="footer-socials">
              <a href="https://www.facebook.com/hedj.eg" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a href="https://www.instagram.com/hedj.eg/" target="_blank" rel="noreferrer" aria-label="Instagram">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="https://www.linkedin.com/company/hedj/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
            </div>
          </div>

          {/* Collections */}
          <div className="footer-col">
            <h4 className="footer-col-heading">Collections</h4>
            <ul>
              {[
                { label: "Kitchens",     path: "/Kitchen" },
                { label: "Bedrooms",     path: "/Bedroom" },
                { label: "Outdoor",      path: "/Outdoor" },
                { label: "Complements",  path: "/DayComplement" },
                { label: "All Products", path: "/products" },
              ].map(({ label, path }) => (
                <li key={path}><Link to={path}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4 className="footer-col-heading">Company</h4>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/contact">Virtual Showroom</Link></li>
              <li><Link to="/dashboard">Admin Console</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>© 2024 Hedj Commerce OS. All rights reserved.</p>
          <div className="footer-legal-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#shipping">Shipping &amp; Returns</a>
            <a href="#sustainability">Sustainability</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
