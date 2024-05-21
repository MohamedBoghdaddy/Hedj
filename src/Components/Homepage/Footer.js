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
      <div className="footer-row">
        <div className="footer-col">
          <h4>Info</h4>
          <ul className="links">
            <li key="about">
              <ScrollLink to="About us" smooth={true} duration={500}>
                About us
              </ScrollLink>{" "}
            </li>
            <li key="Products">
              <RouterLink to="/products">Products</RouterLink>
            </li>
            <li key="contact">
              <RouterLink to="/contact">Contact</RouterLink>
            </li>
            <li key="Favorites">
              <RouterLink to="/favorites">Favorites</RouterLink>
            </li>
            <li key="Dashboard">
              <RouterLink to="/dashboard">Dashboard</RouterLink>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>More</h4>
          <ul className="links">
            <li key="Login">
              <RouterLink to="/login">Login</RouterLink>
            </li>
            <li key="Signup">
              <RouterLink to="/signup">Sign-up</RouterLink>
            </li>
            <li key="cart">
              <RouterLink to="/cart">Cart</RouterLink>
            </li>
            <li key="Locations">
              <ScrollLink to="find-store" smooth={true} duration={500}>
                Location
              </ScrollLink>
            </li>
            <li key="testimonials">
              <RouterLink to="/testimonials">Testimonials</RouterLink>
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
