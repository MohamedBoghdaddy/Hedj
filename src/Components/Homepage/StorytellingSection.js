import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import maram from "../../Assets/Images/maram.jpg";
import "../../Styles/Home.css";

const StorytellingSection = () => (
  <Container className="storytelling-section" id="About us">
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
          Hedj is a furniture and product design brand that creates artisinal
          luxury pieces that add quality to the everyday moments. Hedj
          specializes in designing and working with designs and materials that
          are connected to our context, history and culture. We approach the
          design process with a curious and bold mind, combining traditional
          manufacturing techniques with the latest technological methods.
        </p>
      </Col>
    </Row>
  </Container>
);

export default StorytellingSection;
