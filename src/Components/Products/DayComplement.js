import { useContext, useState } from "react";
import { ShopContext } from "../../context/productContext";
import Slider from "react-slick";
import "../../Styles/Products.css"; // Import CSS
import Rating from "@mui/material/Rating";
import { FaRegHeart } from "react-icons/fa";
import { Button } from "react-bootstrap";

// ✅ Import Images
import img1 from "../../Assets/Images/daybedroom.jpg";
import img2 from "../../Assets/Images/dayroom.jpg";
import img3 from "../../Assets/Images/greenday.jpg";

const DayComplements = () => {
  const { addToCart, addToWishlist } = useContext(ShopContext);
  const [viewMode, setViewMode] = useState("slider"); // Toggle between slider & grid

  // ✅ Product Slider Options
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

  // ✅ Product Data
  const products = [
    {
      id: 1,
      name: "Modern Day Complement",
      price: 2500,
      image: img1,
      rating: 5,
    },
    { id: 2, name: "Elegant Day Room", price: 2700, image: img2, rating: 4.5 },
    { id: 3, name: "Green Themed Room", price: 2900, image: img3, rating: 4.8 },
  ];

  return (
    <div className="dayComplement">
      <h1>Day Complements</h1>

      {/* ✅ View Toggle Button */}
      <div className="view-toggle">
        <Button
          onClick={() => setViewMode("grid")}
          variant={viewMode === "grid" ? "primary" : "light"}
        >
          Grid View
        </Button>
        <Button
          onClick={() => setViewMode("slider")}
          variant={viewMode === "slider" ? "primary" : "light"}
        >
          Slider View
        </Button>
      </div>

      {/* ✅ GRID VIEW */}
      {viewMode === "grid" && (
        <div className="product-list">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
              <h4>{product.name}</h4>
              <p>Elegant and functional additions to your living space.</p>
              <p>Price: ${product.price.toLocaleString()}</p>
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
          ))}
        </div>
      )}

      {/* ✅ SLIDER VIEW */}
      {viewMode === "slider" && (
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
                  <div>
                    Elegant and functional additions to your living space.
                  </div>
                  <div style={{ fontWeight: "bolder" }}>
                    Category: Day Complements
                  </div>
                  <span className="price">
                    ${product.price.toLocaleString()}
                  </span>
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
      )}
    </div>
  );
};

export default DayComplements;
