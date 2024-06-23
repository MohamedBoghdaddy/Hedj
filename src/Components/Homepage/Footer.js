import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faLinkedin,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { Link as RouterLink } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import "../../Styles/Footer.css";
import "../../App.css";

function Footer() {
  return (
    <section className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <h4>Hedj</h4>
          <p>
            Discover elegance and comfort with Hedj, your trusted partner in
            premium furniture. We offer a diverse range of high-quality pieces
            designed to elevate your home. From timeless classics to modern
            trends, we have something for every taste. Explore our collection
            today and transform your space.
          </p>
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
        
        <div className="footer-col">
          <h4>Subscribe to our Newsletter</h4>
          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Footer;
