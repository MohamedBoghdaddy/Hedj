import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faLinkedin,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";
import "../../Styles/Footer.css"; // Import the CSS file
import "../../App.css";

function Footer() {
  return (
    <section className="footer">
      <div className="footer-row">
        <div className="footer-col">
          <h4>Info</h4>
          <ul className="links">
            <li key="about">
              <Link to="../Homepage/Home.js">About Us</Link>
            </li>
            <li key="Products">
              <Link to="../Products/Products.js">Products</Link>
            </li>
            <li key="contact">
              <Link to="../Contact/contact.js">Contact</Link>
            </li>
            <li key="Favorites">
              <Link to="../Products/Favorites.js">Favorites</Link>
            </li>
            <li key="Dashboard">
              <Link to="../dashboard/Dashboard.jsx">Dashboard</Link>
            </li>
          </ul>
        </div>
        {/* <div className="footer-col">
          <h4>Legal</h4>
          <ul className="links">
            <li key="customer-agreement">
              <Link to="/customer-agreement">Customer Agreement</Link>
            </li>
            <li key="privacy-policy">
              <Link to="/privacy-policy">Privacy Policy</Link>
            </li>
            <li key="gdpr">
              <Link to="/gdpr">GDPR</Link>
            </li>
            <li key="security">
              <Link to="/security">Security</Link>
            </li>
            <li key="testimonials">
              <Link to="/testimonials">Testimonials</Link>
            </li>
            <li key="media-kit">
              <Link to="/media-kit">Media Kit</Link>
            </li>
          </ul>
        </div> */}
        <div className="footer-col">
          <h4>Hedj</h4>
          <p>
            Discover elegance and comfort with Hedj, your trusted partner in
            premium furniture. We offer a diverse range of high-quality pieces
            designed to elevate your home. From timeless classics to modern
            trends, we have something for every taste. Explore our collection
            today and transform your space.
          </p>
          {/* <form action="#">
            <input type="text" placeholder="Your email" required />
            <button type="submit">SUBSCRIBE</button>
          </form> */}
          <div className="icons">
            <a href="https://www.facebook.com/hedj.eg">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>{" "}
            <a href="https://www.instagram.com/hedj.eg/">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://www.linkedin.com/company/hedj/">
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Footer;
