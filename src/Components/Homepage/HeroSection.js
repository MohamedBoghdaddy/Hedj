import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../Styles/Home.css"; // Adjust path as needed
import vid2 from "../../Assets/videos/vid2.mp4";

const HeroSection = () => (
  <div className="hero-section" id="hero-section">
    <Container>
      <Row>
        <Col>
          <h1>Welcome to Hedj</h1>
          <p>
            Premium furniture crafted with a touch of elegance.
             We create pieces
            that transform your house into a home.
          </p>
          <Button variant="dark" as={Link} to="/Products">
            Shop Now
          </Button>
          <video className="video-background" src={vid2} autoPlay muted loop>
            Your browser does not support the video tag.
          </video>
        </Col>
      </Row>
    </Container>
  </div>
);

export default HeroSection;
