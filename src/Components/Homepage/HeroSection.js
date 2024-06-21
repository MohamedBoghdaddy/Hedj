import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../Styles/Home.css";

const HeroSection = () => (
  <div className="hero-section">
    <Container>
      <Row>
        <Col>
          <h1>Welcome to Hedj</h1>
          <p>
            Premium furniture crafted with a touch of elegance. We create pieces
            that transform your house into a home.
          </p>
          <Button variant="dark" as={Link} to="/shop">
            Shop Now
          </Button>
        </Col>
      </Row>
    </Container>
  </div>
);

export default HeroSection;
