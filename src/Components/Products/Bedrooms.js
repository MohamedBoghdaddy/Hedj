import { useState, useContext } from "react";
import Slider from "react-slick";
import Rating from "@mui/material/Rating";
import { FaRegHeart } from "react-icons/fa";
import { Button } from "react-bootstrap";
import { ShopContext } from "../../context/productContext";
import "../../Styles/bedroom.css"; // Import the merged styles

// 🔹 Import images directly
import img1 from "../../Assets/Images/70.jpg";
import img2 from "../../Assets/Images/73.jpg";
import img3 from "../../Assets/Images/74.jpg";

const Bedrooms = () => {
  const { addToCart, addToWishlist } = useContext(ShopContext);
  const [viewMode, setViewMode] = useState("slider"); // 🔹 Toggle between "slider" and "grid"

  // 🔹 Product Slider Options
  const productSliderOptions = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 2, slidesToScroll: 1 },
      },
      {
        breakpoint: 992,
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
    ],
  };

  // 🔹 Product Data
  const products = [
    { id: 1, name: "Modern Bedroom", price: 18000, image: img1, rating: 5 },
    { id: 2, name: "Grey Bedroom", price: 20000, image: img2, rating: 4.5 },
    { id: 3, name: "Double Bedroom", price: 23000, image: img3, rating: 5 },
  ];

  return (
    <div className="bedroomproduct">
      <h1>Bedrooms</h1>

      {/* 🔹 Toggle View Button */}
      <div className="view-mode-toggle">
        <Button
          variant="outline-light"
          onClick={() => setViewMode(viewMode === "slider" ? "grid" : "slider")}
        >
          {viewMode === "slider" ? "Switch to Grid View" : "Switch to Slider View"}
        </Button>
      </div>

      {/* 🔹 Slider View Mode */}
      {viewMode === "slider" ? (
        <div className="slider1">
          <Slider {...productSliderOptions}>
            {products.map((product) => (
              <div key={product.id} className="item productItem">
                <div className="imgWrapper">
                  <img
                    src={product.image}
                    className="resizeImg"
                    alt={product.name}
                  />
                </div>
                <div className="infoWrapper">
                  <h5 style={{ fontWeight: "bolder" }}>{product.name}</h5>
                  <div>Elegant bedroom design with a luxurious finish.</div>
                  <div style={{ fontWeight: "bolder" }}>Category: Bedrooms</div>
                  <span className="price">${product.price.toLocaleString()}</span>
                  <div className="actionsandrating">
                    <Rating
                      name="read-only"
                      value={product.rating}
                      readOnly
                      size="small"
                      precision={0.5}
                    />
                    <div className="actions">
                      <Button onClick={() => addToWishlist(product)}>
                        <FaRegHeart />
                      </Button>
                    </div>
                    <Button
                      variant="dark"
                      className="cart-button"
                      onClick={() => addToCart(product)}
                    >
                      Add to cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        // 🔹 Grid View Mode
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.name} className="product-image" />
              <h4>{product.name}</h4>
              <p>Elegant bedroom design with a luxurious finish.</p>
              <p><strong>Category:</strong> Bedrooms</p>
              <p className="price">${product.price.toLocaleString()}</p>
              <div className="actionsandrating">
                <Rating name="read-only" value={product.rating} readOnly size="small" />
                <div className="actions">
                  <Button onClick={() => addToWishlist(product)}>
                    <FaRegHeart />
                  </Button>
                </div>
                <Button variant="dark" className="cart-button" onClick={() => addToCart(product)}>
                  Add to cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bedrooms;
