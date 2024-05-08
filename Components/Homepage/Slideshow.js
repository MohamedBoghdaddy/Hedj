import React from "react";
import Carousel from "react-bootstrap/Carousel";
import "bootstrap/dist/css/bootstrap.min.css"; // Include Bootstrap CSS

// Placeholder image sources - ensure these paths are correct
import firstSlide from "../../Assets/Images/8.jpg";
import secondSlide from "../../Assets/Images/83.jpg";
import thirdSlide from "../../Assets/Images/137.jpg";
import "../../Styles/Slideshow.css";

function CarouselFadeExample() {
  return (
    <Carousel fade>
      <Carousel.Item>
        <img
          src={firstSlide}
          alt="First slide"
          style={{ width: "100%", height: "auto" }} // Ensure the image fits
        />
        <Carousel.Caption>
          <h3>First slide label</h3>
          <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img
          src={secondSlide}
          alt="Second slide"
          style={{ width: "100%", height: "auto" }}
        />
        <Carousel.Caption>
          <h3>Second slide label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img
          src={thirdSlide}
          alt="Third slide"
          style={{ width: "100%", height: "auto" }}
        />
        <Carousel.Caption>
          <h3>Third slide label</h3>
          <p>
            Praesent commodo cursus magna, vel scelerisque nisl consectetur.
          </p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}

export default CarouselFadeExample;
