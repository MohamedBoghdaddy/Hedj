import React from "react";
import "../../Styles/Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";

function Footer() {
  return (
    <div className="app-footer">
      <h2>Hedj</h2>
      <div className="content">
        <p>
          Discover elegance and comfort with Hedj, your trusted partner in
          premium furniture. We offer a diverse range of high-quality pieces
          designed to elevate your home.
        </p>
      </div>

      <div className="social-icons">
        <a href="https://www.instagram.com/hedj.eg/">
          <FontAwesomeIcon icon={faInstagram} className="fa-brands" />
        </a>

        <a href="https://www.linkedin.com/company/hedj/">
          <FontAwesomeIcon icon={faLinkedin} className="fa-brands" />
        </a>
      </div>
    </div>
  );
}

export default Footer;
