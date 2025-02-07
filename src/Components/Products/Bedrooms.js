import { useContext } from "react";
import { ShopContext } from "../../context/productContext";
import { Button } from "react-bootstrap";
import "../../Styles/Products.css";

const Bedrooms = () => {
  const { addToCart, addToWishlist } = useContext(ShopContext);

  const products = [
    { id: 1, name: "Modern Bedroom", price: 18000, image: "bedroom1.jpg" },
    { id: 2, name: "Grey Bedroom", price: 20000, image: "bedroom2.jpg" },
    { id: 3, name: "Double Bedroom", price: 23000, image: "bedroom3.jpg" },
  ];

  return (
    <div className="Container">
      <div className="main-container">
        <div className="form-container">
          <div className="row1">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} />
                <h4>{product.name}</h4>
                <p>Price: ${product.price.toLocaleString()}</p>
                <Button onClick={() => addToCart(product)}>Add to Cart</Button>
                <Button onClick={() => addToWishlist(product)}>
                  Add to Wishlist
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bedrooms;
