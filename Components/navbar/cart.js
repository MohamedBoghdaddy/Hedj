import React from 'react';

const Cart = ({ cart, removeFromCart }) => {
    // Function to calculate the total number of products in the cart
    const calculateTotalProducts = () => {
        if (!cart || cart.length === 0) return 0;
        
        let totalProducts = 0;
        cart.forEach(item => {
            totalProducts += item.quantity || 1; // If quantity is not provided, default to 1
        });
        return totalProducts;
    };

    // Function to calculate the total price of products in the cart
    const calculateTotalPrice = () => {
        if (!cart || cart.length === 0) return 0;
        
        let totalPrice = 0;
        cart.forEach(item => {
            totalPrice += (item.price * item.quantity || 1); // Calculate price based on item quantity
        });
        return totalPrice;
    };

    // Function to handle removal of an item from the cart
    const handleRemoveItem = (index) => {
        // Call the removeFromCart function passed from the parent component
        removeFromCart(index);
    };

    return (
        <div>
            <h2>Cart</h2>
            <p>Total Products: {calculateTotalProducts()}</p>
            <p>Total Price: ${calculateTotalPrice().toFixed(2)}</p>
            <ul>
                {cart && cart.map((item, index) => (
                    <li key={index}>
                        {item.name} - ${item.price} ({item.quantity || 1})
                        <button onClick={() => handleRemoveItem(index)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Cart;



