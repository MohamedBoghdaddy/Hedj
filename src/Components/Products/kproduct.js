import { useContext } from "react";
import { ShopContext } from "../../context/productContext";
import "../../Styles/Products.css";
import { Button } from "react-bootstrap";

const KProduct = () => {
  const { addToCart, addToWishlist } = useContext(ShopContext);

  const kitchenProducts = [
    {
      id: 1,
      name: "Luxury Kitchen",
      price: 25000,
      image:
        "https://i.pinimg.com/736x/c7/26/55/c726555b47cf7fae4bd96e7e1cdcee66.jpg",
      description: "Elegant and modern kitchen setup.",
    },
  ];

  return (
    <div className="product-container">
      <h2>Kitchen Products</h2>
      <div className="product-list">
        {kitchenProducts.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
            <h4>{product.name}</h4>
            <p>Price: ${product.price.toLocaleString()}</p>
            <p>{product.description}</p>
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

export default KProduct;
