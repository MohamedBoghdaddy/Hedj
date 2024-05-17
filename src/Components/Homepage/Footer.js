import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faTwitter,
  faLinkedin,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-scroll";
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
              <a href="#">About Us</a>
            </li>
            <li key="Products">
              <a href="#">Products</a>
            </li>
            <li key="contact">
              <a href="#">Contact</a>
            </li>
            <li key="Favorites">
              <a href="#">Favorites</a>
            </li>
            <li key="Dashboard">
              <a href="#">Dashboard</a>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <ul className="links">
            <li key="customer-agreement">
              <a href="#">Customer Agreement</a>
            </li>
            <li key="privacy-policy">
              <a href="#">Privacy Policy</a>
            </li>
            <li key="gdpr">
              <a href="#">GDPR</a>
            </li>
            <li key="security">
              <a href="#">Security</a>
            </li>
            <li key="testimonials">
              <a href="#">Testimonials</a>
            </li>
            <li key="media-kit">
              <a href="#">Media Kit</a>
            </li>
          </ul>
        </div>
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
