import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import maram2 from "../../Assets/Images/maram2.jpg";
import "../../Styles/Home.css";
import pdf from "../../Assets/collection/HEDJ-Company Profile-2024 Q01.pdf";

const CallToActionSection = () => {
  const downloadPdf = () => {
    fetch(pdf)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "HEDJ-Company Profile-2024 Q01.pdf");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((error) => {
        console.error("Error downloading PDF:", error);
      });
  };

  return (
    <Container className="Section4" id="view-collection">
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
            onClick={downloadPdf}
            style={{
              color: "#fff",
              padding: "10px 20px",
              border: "1px solid #333",
              borderRadius: "5px",
              margin: "10px",
              transition: "0.3s",
            }}
          >
            view collection
          </Button>
          {/* <Button
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
          </Button> */}
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
};

export default CallToActionSection;
