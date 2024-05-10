import React from "react";
import { Container, Row, Col, Button} from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../Styles/Home.css";
import maram from "../../Assets/Images/maram.jpg"; // Your company logo
import maram2 from "../../Assets/Images/maram2.jpg"; // Your company logo
import vr from "../../Assets/Images/VR.png"; // Your company logo

const Home = () => {
  return (
    <div className="full-page">
      {/* Hero Section with High-Quality Imagery */}
      <div className="hero-section">
        <Container>
          <Row>
            <Col>
              <h1>Welcome to Hedj </h1>
              <p>
                Premium furniture crafted with a touch of elegance. We create
                pieces that transform your house into a home.
              </p>
              <Button variant="dark" as={Link} to="/shop">
                Shop Now
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Storytelling Section */}
      <Container className="storytelling-section">
        <Row>
          <Col md={6}>
            <img
              src={maram}
              alt="Company-team"
              style={{ width: "400px", height: "auto" }}
            />
          </Col>
          <Col md={6}>
            <h2>Our Story</h2>
            <p>
              Hedj is a furniture and product design brand that creates
              artisinal luxury pieces that add quality to the everyday moments.
              Hedj specializes in designing and working with designs and
              materials that are connected to our context, history and culture.
              We approach the design process with a curious and bold mind,
              combining traditional manufacturing techniques with the latest
              technological methods
            </p>
          </Col>
        </Row>
      </Container>

      {/* Calls to Action */}
      <Container className="Section2">
        <Row>
          <Col md={6}>
            <img
              src={maram2}
              alt="Company-team"
              style={{ width: "400px", height: "auto" }}
            />
          </Col>
          <Col md={6} className="d-flex justify-content-center">
            {" "}
            {/* Use flexbox and center */}
            <Button
              variant="dark"
              as={Link}
              to="/collections"
              style={{
                color: "#fff",
                padding: "10px 20px",
                border: "1px solid #333",
                borderRadius: "5px",
                margin: "10px",
                transition: "0.3s",
              }}
            >
              View Collections
            </Button>
            <Button
              variant="dark"
              as={Link}
              to="/contact"
              style={{
                color: "#fff",
                padding: "10px 20px",
                border: "1px solid #333",
                borderRadius: "5px",
                margin: "10px",
                transition: "0.3s",
              }}
            >
              Contact Us
            </Button>
          </Col>
        </Row>
      </Container>
      {/* Virtual Showroom or AR Integration */}
      <Container className="virtual-showroom">
          <Col md={8}>
            <img
              src={vr}
              alt="vr"
              style={{ width: "400px", height: "auto" }}
            />
          </Col>
          <Row>
          <Col>
            <h2>Experience Our Virtual Showroom</h2>
            <p>
              Explore our furniture in a virtual environment or use our AR tool
              to visualize our pieces in your own space.
            </p>
            <Button variant="dark" as={Link} to="/virtual-showroom">
              Visit Virtual Showroom
            </Button>
          </Col>
        
        </Row>
      </Container>

      {/* Contact Information and Store Locator */}
      <Container className="contact-info">
        <Row>
          <Col>
            <h2>Get in Touch</h2>
            <p>
              Visit our showroom, contact our support team, or find the closest
              store. We're here to help.
            </p>
            <Button
              variant="dark"
              href="https://www.bing.com/maps?where=11+Fouad+Thabet+st.%2C+Square+1166%2C+Sheraton%2C+Cairo%2C+Egypt%2C+Cairo%2C+EG&cp=30.097745%7E31.374899&lvl=16.6"
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              {/* External Link */}
              Find a Store
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
