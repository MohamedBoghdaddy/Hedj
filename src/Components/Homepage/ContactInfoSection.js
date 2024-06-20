import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "../../Styles/Home.css";

const ContactInfoSection = () => (
  <Container className="contact-info" id="find-store">
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
          Find a Store
        </Button>
      </Col>
    </Row>
  </Container>
);

export default ContactInfoSection;
