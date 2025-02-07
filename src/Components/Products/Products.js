import { useContext } from "react";
import { ShopContext } from "../../context/productContext";
import { Button } from "react-bootstrap";
import "../../Styles/Products.css";

const Products = () => {
  const { addToCart, addToWishlist } = useContext(ShopContext);

  const products = [
    {
      id: 1,
      name: "Classic Sofa",
      price: 12000,
      image: "https://example.com/sofa.jpg",
      description: "Comfortable and stylish sofa for your living room.",
    },
    {
      id: 2,
      name: "Dining Table",
      price: 18000,
      image: "https://example.com/table.jpg",
      description: "Modern dining table set for a perfect family dinner.",
    },
    {
      id: 3,
      name: "Office Chair",
      price: 5000,
      image: "https://example.com/chair.jpg",
      description: "Ergonomic office chair for comfort and productivity.",
    },
  ];

  return (
    <div className="product-container">
      <h2>Our Products</h2>
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
            <Button onClick={() => addToCart(product)}>Add to Cart</Button>
            <Button onClick={() => addToWishlist(product)}>
              Add to Wishlist
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
