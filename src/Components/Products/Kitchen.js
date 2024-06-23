import React, { useContext } from "react";
import Slider from "react-slick";
import "../../Styles/kitchen.css";
import Rating from "@mui/material/Rating";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faHeart } from "@fortawesome/free-solid-svg-icons";

import "../../Styles/Products.css"; // Import the CSS
import { Button } from "react-bootstrap";
import { WishlistContext } from "../Products/wishlistContext"; // Import Wishlist Context

const Kitcard = () => {
  const { addToWishlist } = useContext(WishlistContext); // Get addToWishlist function from context

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
      {
        breakpoint: 776,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };
  const products = [
    {
      image:
        "https://i.pinimg.com/736x/c7/26/55/c726555b47cf7fae4bd96e7e1cdcee66.jpg",
      name: "Woody Kitchen",
      brand: "Brand Name",
      originalPrice: "$20000",
      discountedPrice: "$18000",
      description: "A beautiful wooden kitchen set.",
      link: "/product-link",
    },
    // Add more products as needed
  ];
  return (
    <div className="kitchenproduct">
      <h1>Kitchens</h1>
      <div className="slider1">
        <Slider {...productSliderOptions}>
          {products.map((product, index) => (
            <div className="item" key={index}>
              <div className="imgWrapper">
                <img
                  src={product.image}
                  className="resizeImg"
                  alt={product.name}
                />
                <div className="actions">
                  <Button variant="dark" onClick={() => addToWishlist(product)}>
                    <FontAwesomeIcon icon={faHeart} />
                  </Button>
                </div>
              </div>
              <h4>{product.name}</h4>
              <Rating
                name="read-only"
                value={5}
                readOnly
                size="small"
                precision={0.5}
              />
              <span className="ml-2">{product.discountedPrice}</span>
              <Button variant="primary" className="cart-button">
                Add to Cart
              </Button>
            </div>
          ))}
          <div className="item productItem">
            <div className="imgWrapper">
              <img
                src="https://i.pinimg.com/564x/a9/f9/93/a9f993e2c49fdea25a82cd04f783d072.jpg"
                className="resizeImg"
              />
              <div className="actions">
                <Button variant="dark">
                  <FontAwesomeIcon icon={faHeart} />
                </Button>
              </div>
            </div>
            <h4>Woody Kitchen</h4>
            <Rating
              name="read-only"
              value={5}
              readOnly
              size="small"
              precision={0.5}
            />

            <Button variant="primary" className="cart-button">
              Add to Cart
            </Button>
          </div>

          <div className="item productItem">
            <div className="imgWrapper">
              <img
                src="https://i.pinimg.com/564x/be/bc/33/bebc33ee1bf891e8c3da7f31eab114b8.jpg"
                className="resizeImg"
              />
            </div>
            <div className="actions">
              <Button variant="dark">
                <FontAwesomeIcon icon={faHeart} />
              </Button>
            </div>
            <h4>Woody Kitchen</h4>
            <Rating
              name="read-only"
              value={4}
              readOnly
              size="small"
              precision={0.5}
            />
            <Button variant="primary" className="cart-button">
              Add to Cart
            </Button>
          </div>

          <div className="item productItem">
            <div className="imgWrapper">
              <img
                src="https://i.pinimg.com/564x/87/08/a7/8708a71401f1dd16393d54c106657645.jpg"
                className="resizeImg"
              />
            </div>
            <div className="actions">
              <Button variant="dark">
                <FontAwesomeIcon icon={faHeart} />
              </Button>
            </div>
            <h4>Woody Kitchen</h4>
            <Rating
              name="read-only"
              value={3}
              readOnly
              size="small"
              precision={0.5}
            />
            <Button variant="primary" className="cart-button">
              Add to Cart
            </Button>
          </div>

          <div className="item productItem">
            <div className="imgWrapper">
              <img
                src="https://i.pinimg.com/564x/01/4b/03/014b032e788312ce4231cd61dc5f5f97.jpg"
                className="resizeImg"
              />
            </div>
            <div className="actions">
              <Button variant="dark">
                <FontAwesomeIcon icon={faHeart} />
              </Button>
            </div>
            <h4>Woody Kitchen</h4>
            <Rating
              name="read-only"
              value={2}
              readOnly
              size="small"
              precision={0.5}
            />
            <Button variant="primary" className="cart-button">
              Add to Cart
            </Button>
          </div>
          <div className="item productItem">
            <div className="imgWrapper">
              <img
                src="https://i.pinimg.com/564x/39/34/11/393411a46bb801d10eeab69214596516.jpg"
                className="resizeImg"
              />
            </div>
            <div className="actions">
              <Button variant="dark">
                <FontAwesomeIcon icon={faHeart} />
              </Button>
            </div>
            <h4>Woody Kitchen</h4>
            <Rating
              name="read-only"
              value={5}
              readOnly
              size="small"
              precision={0.5}
            />
            <Button variant="primary" className="cart-button">
              Add to Cart
            </Button>
          </div>
        </Slider>
      </div>
    </div>
  );
};

export default Kitcard;
