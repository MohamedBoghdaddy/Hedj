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
              <Link to="../Home">About Us</Link>
            </li>
            <li key="Products">
              <Link to="../Products">Products</Link>
            </li>
            <li key="contact">
              <Link to="../contact">Contact</Link>
            </li>
            <li key="Favorites">
              <Link to="../Favorites">Favorites</Link>
            </li>
            <li key="Dashboard">
              <Link to="../dashboard/">Dashboard</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>More</h4>
          <ul className="links">
            <li key="Login">
              <Link to="../Login">Login</Link>
            </li>
            <li key="Signup">
              <Link to="../Signup">Sign-up</Link>
            </li>
            <li key="cart">
              <Link to="../cart">Cart</Link>
            </li>
            <li key="Locations">
              <Link to="#Find Store">Location</Link>
            </li>
            <li key="testimonials">
              <Link to="/testimonials">Testimonials</Link>
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
