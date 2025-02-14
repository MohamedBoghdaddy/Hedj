import Slider from "react-slick";
import Rating from "@mui/material/Rating";
import { FaRegHeart } from "react-icons/fa";
import { Button } from "react-bootstrap";
import "../../Styles/Products.css"; // Import the CSS

const Outdoor = () => {
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
    <div className="outdoor">
      <h1>Outdoor</h1>
      <div className="slider1">
        <Slider {...productSliderOptions}>
          <div className="item productItem">
            <div className="imgWrapper">
              <img
                src="https://example.com/outdoor-furniture1.jpg"
                className="resizeImg"
                alt="Elegant Outdoor Set"
              />
            </div>
            <div className="infoWrapper">
              <h5 style={{ fontWeight: "bolder" }}>Elegant Outdoor Set</h5>
              <div>Transform your outdoor space with style and comfort.</div>
              <div style={{ fontWeight: "bolder" }}>Category: Outdoor</div>
              <span className="price">$5500</span>
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

export default Outdoor;
