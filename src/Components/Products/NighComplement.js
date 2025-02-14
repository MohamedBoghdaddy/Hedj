import Slider from "react-slick";
import Rating from "@mui/material/Rating";
import { FaRegHeart } from "react-icons/fa";
import { Button } from "react-bootstrap";
import "../../Styles/Products.css"; // Import the CSS

const NightComplement = () => {
  const productSliderOptions = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="nightComplement">
      <h1>Night Complements</h1>
      <div className="slider1">
        <Slider {...productSliderOptions}>
          <div className="item productItem">
            <div className="imgWrapper">
              <img
                src="https://example.com/night-complement1.jpg"
                className="resizeImg"
                alt="Luxury Night Complement"
              />
            </div>
            <div className="infoWrapper">
              <h5 style={{ fontWeight: "bolder" }}>Luxury Night Complement</h5>
              <div>Perfect additions for a cozy and comfortable bedroom.</div>
              <div style={{ fontWeight: "bolder" }}>
                Category: Night Complements
              </div>
              <span className="price">$3200</span>
              <div className="actionsandrating">
                <Rating name="read-only" value={4.5} readOnly size="small" />
                <div className="actions">
                  <Button>
                    <FaRegHeart />
                  </Button>
                </div>
                <Button variant="dark" className="cart-button">
                  Add to cart
                </Button>
              </div>
            </div>
          </div>
        </Slider>
      </div>
    </div>
  );
};

export default NightComplement;
