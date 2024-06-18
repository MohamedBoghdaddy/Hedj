import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import maram2 from "../../Assets/Images/maram2.jpg";

const CallToActionSection = () => (
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
);

export default CallToActionSection;
