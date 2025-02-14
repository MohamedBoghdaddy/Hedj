import Slider from "react-slick";
import Rating from "@mui/material/Rating";
import { FaRegHeart } from "react-icons/fa";
import { Button } from "react-bootstrap";
import "../../Styles/Products.css"; // Import the CSS

const DayComplement = () => {
  const productSliderOptions = {
    dots: true,
    infinite: true,
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
    <div className="dayComplement">
      <h1>Day Complements</h1>
      <div className="slider1">
        <Slider {...productSliderOptions}>
          <div className="item productItem">
            <div className="imgWrapper">
              <img
                src="https://example.com/day-complement1.jpg"
                className="resizeImg"
                alt="Modern Day Complement"
              />
            </div>
            <div className="infoWrapper">
              <h5 style={{ fontWeight: "bolder" }}>Modern Day Complement</h5>
              <div>Elegant and functional additions to your living space.</div>
              <div style={{ fontWeight: "bolder" }}>
                Category: Day Complements
              </div>
              <span className="price">$2500</span>
              <div className="actionsandrating">
                <Rating name="read-only" value={5} readOnly size="small" />
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

export default DayComplement;
