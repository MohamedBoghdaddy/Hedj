import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faLinkedin,
  faFacebook,
  faTwitter,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

function Footer() {
  return (
    <div className="footer-wrapper">
      <Container>
        <Row className="align-items-center justify-content-between">
          <Col md="4" lg="4" xl="4" className="mb-4">
            <h6 className="text-uppercase fw-bold">Hedj</h6>
            <p>
              Discover elegance and comfort with Hedj, your trusted partner in
              premium furniture. We offer a diverse range of high-quality pieces
              designed to elevate your home. From timeless classics to modern
              trends, we have something for every taste. Explore our collection
              today and transform your space.
            </p>
          </Col>

          <Col md="3" lg="3" xl="3" className="mb-4">
            <h6 className="text-uppercase fw-bold">Useful Links</h6>
            <ul>
              <li>
                <a href="/shop">Shop</a>
              </li>
              <li>
                <a href="/about">About Us</a>
              </li>
              <li>
                <a href="/contact">Contact Us</a>
              </li>
              <li>
                <a href="/collections">Collections</a>
              </li>
            </ul>
          </Col>

          <Col md="3" lg="3" xl="3" className="mb-4">
            <h6 className="text-uppercase fw-bold">Contact</h6>
            <p>Cairo, Egypt</p>
            <p>info@hedj.com</p>
            <p>+20 123 456 789</p>
            <p>+20 987 654 321</p>
          </Col>

          <Col md="2" lg="2" xl="2">
            <div className="social-icons">
              <a href="https://www.instagram.com/hedj.eg/">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="https://www.linkedin.com/company/hedj/">
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
              <a href="https://www.facebook.com/">
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="https://twitter.com/">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="https://github.com/">
                <FontAwesomeIcon icon={faGithub} />
              </a>
            </div>
          </Col>
        </Row>

        <Row className="text-center copyright-row">
          <Col>
            <p>
              © {new Date().getFullYear()} Copyright:{" "}
              <a href="https://hedj.com/">Hedj</a>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Footer;
