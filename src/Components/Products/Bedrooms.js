import Slider from "react-slick";
import "../../Styles/bedroom.css";
import Rating from "@mui/material/Rating";
import { FaRegHeart } from "react-icons/fa";
import { Button } from "react-bootstrap";
import { useContext } from "react";
import { ShopContext } from "../../context/productContext";
import "../../Styles/Products.css"; // Import the CSS

// 🔹 Import images directly (BEST PRACTICE)
import img1 from "../../Assets/Images/70.jpg";
import img2 from "../../Assets/Images/73.jpg";
import img3 from "../../Assets/Images/74.jpg";

const Bedrooms = () => {
  const { addToCart, addToWishlist } = useContext(ShopContext);

  const productSliderOptions = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // 🔹 Corrected Product Array with Imported Images
  const products = [
    { id: 1, name: "Modern Bedroom", price: 18000, image: img1, rating: 5 },
    { id: 2, name: "Grey Bedroom", price: 20000, image: img2, rating: 4.5 },
    { id: 3, name: "Double Bedroom", price: 23000, image: img3, rating: 5 },
  ];

  return (
    <div className="bedroomproduct">
      <h1>Bedrooms</h1>
      <div className="slider1">
        <Slider {...productSliderOptions}>
          {products.map((product) => (
            <div key={product.id} className="item productItem">
              <div className="imgWrapper">
                <img
                  src={product.image} // ✅ Image Now Works
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
    </div>
  );
};

export default Bedrooms;
