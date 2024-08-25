import React from "react";
import Slider from "react-slick";
import "../../Styles/kitchen.css";
import Rating from "@mui/material/Rating";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FaRegHeart } from "react-icons/fa";
import { Button } from "react-bootstrap";
import "../../Styles/Products.css"; // Import the CSS

const Kitchen = () => {
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
    <div className="kitchenproduct">
      <h1>Kitchens</h1>
      <div className="slider1">
        <Slider {...productSliderOptions}>
          <div className="item productItem">
            <div className="imgWrapper">
              <img
                src="https://i.pinimg.com/736x/c7/26/55/c726555b47cf7fae4bd96e7e1cdcee66.jpg"
                className="resizeImg"
                alt="Woody Kitchen"
              />
            </div>
            <Button className="fav">
              <FontAwesomeIcon icon={faHeart} />
            </Button>
            <div className="infoWrapper">
              <h5 style={{ fontWeight: "bolder" }}>Woody Kitchen</h5>
              <div>
                This kitchen has a white color scheme that is able to make the
                kitchen look bright and clean.
              </div>
              <div style={{ fontWeight: "bolder" }}>Category: Kitchens</div>
              <span className="price">$18000</span>
              <div className="actionsandrating">
                <Rating
                  name="read-only"
                  value={5}
                  readOnly
                  size="small"
                  precision={0.5}
                />
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

          {/* Repeat for other products */}
        </Slider>
      </div>
    </div>
  );
};

export default Kitchen;
