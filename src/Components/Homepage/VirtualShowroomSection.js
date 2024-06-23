import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import vr from "../../Assets/Images/VR.png";
import "../../Styles/Home.css";

const VirtualShowroomSection = () => (
  <Container className="virtual-showroom">
    <Row className="align-items-center">
      <Col md={6}>
        <img src={vr} alt="vr" style={{ width: "50%", height: "auto" }} />
      </Col>
      <Col md={6}>
          <h2>Experience Our Virtual Showroom</h2>
          <p>
            Explore our furniture in a virtual environment or use our AR tool to
            visualize our pieces in your own space.
          </p>
          <Button variant="dark" as={Link} to="/virtual-showroom">
            Visit Virtual Showroom
          </Button>
      </Col>
    </Row>
  </Container>
);

export default VirtualShowroomSection;
