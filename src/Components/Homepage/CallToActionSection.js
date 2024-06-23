import React from "react";
import { Container, Button } from "react-bootstrap";
import maram2 from "../../Assets/Images/70.jpg";
import maram3 from "../../Assets/Images/24.jpg";
import maram4 from "../../Assets/Images/89.jpg";
import maram5 from "../../Assets/Images/90.jpg";

import "../../Styles/Home.css";
import pdf from "../../Assets/collection/HEDJ-Company Profile-2024 Q01.pdf";
import Card from "react-bootstrap/Card";
import Slider from "react-slick";
import "../../Styles/kitchen.css";

const CallToActionSection = () => {
  const downloadPdf = () => {
    fetch(pdf)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "HEDJ-Company Profile-2024 Q01.pdf");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error downloading PDF:", error);
      });
  };

  const productSliderOptions = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 776,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <Container className="Section4" id="view-collection">
      <Slider {...productSliderOptions}>
        {[maram2, maram3, maram4, maram5, maram2, maram3, maram4, maram5].map(
          (image, index) => (
            <div key={index}>
              <Card style={{ width: "18rem" }}>
                <Card.Img variant="top" src={image} />
                <Card.Body>
                  <Card.Title>Card Title</Card.Title>
                  <Card.Text>
                    Some quick example text to build on the card title and make
                    up the bulk of the card's content.
                  </Card.Text>
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
                    Download Collection
                  </Button>
                </Card.Body>
              </Card>
            </div>
          )
        )}
      </Slider>
    </Container>
  );
};

export default CallToActionSection;
