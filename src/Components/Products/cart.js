import React from "react";
import "../../Styles/Products.css";

const Cart = ({ cart, removeFromCart }) => {
  // Function to calculate the total number of products in the cart
  const calculateTotalProducts = () => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  // Function to calculate the total price of products in the cart
  const calculateTotalPrice = () => {
    return cart.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0
    );
  };

  return (
    <div>
      <h2>Cart</h2>
      <p>Total Products: {calculateTotalProducts()}</p>
      <p>Total Price: ${calculateTotalPrice().toFixed(2)}</p>
      <ul>
        {cart.map((item, index) => (
          <li key={index}>
            {item.name} - ${item.price} ({item.quantity || 1})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Cart;
