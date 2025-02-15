import { useContext, useState } from "react";
import { ShopContext } from "../../context/productContext";
import { Button } from "react-bootstrap";
import "../../Styles/Products.css";
import Rating from "@mui/material/Rating";
import { FaRegHeart } from "react-icons/fa";

const Products = () => {
  const { addToCart, addToWishlist } = useContext(ShopContext);
  const [viewMode, setViewMode] = useState("grid"); // Toggle between grid and slider view

  // ✅ Sample Products Data
  const products = [
    {
      id: 1,
      name: "Classic Sofa",
      price: 12000,
      image: "https://example.com/sofa.jpg",
      description: "Comfortable and stylish sofa for your living room.",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Dining Table",
      price: 18000,
      image: "https://example.com/table.jpg",
      description: "Modern dining table set for a perfect family dinner.",
      rating: 5,
    },
    {
      id: 3,
      name: "Office Chair",
      price: 5000,
      image: "https://example.com/chair.jpg",
      description: "Ergonomic office chair for comfort and productivity.",
      rating: 4.5,
    },
  ];

  return (
    <div className="product-container">
      <h1>Our Products</h1>

      {/* ✅ View Toggle Button */}
      <div className="view-toggle">
        <Button
          onClick={() => setViewMode("grid")}
          variant={viewMode === "grid" ? "primary" : "light"}
        >
          Grid View
        </Button>
        <Button
          onClick={() => setViewMode("list")}
          variant={viewMode === "list" ? "primary" : "light"}
        >
          List View
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
              <p>{product.description}</p>
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

      {/* ✅ LIST VIEW */}
      {viewMode === "list" && (
        <div className="product-list list-view">
          {products.map((product) => (
            <div key={product.id} className="product-row">
              <img
                src={product.image}
                alt={product.name}
                className="product-image-list"
              />
              <div className="product-info">
                <h4>{product.name}</h4>
                <p>{product.description}</p>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
