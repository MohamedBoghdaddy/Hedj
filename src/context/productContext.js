import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const ShopContext = createContext(null);

// ✅ Helper function to get stored items from localStorage
const getStoredData = (key, defaultValue) => {
  const storedData = localStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : defaultValue;
};

// ✅ Initialize Cart & Wishlist
const getDefaultCart = () => getStoredData("cartItems", {});
const getDefaultWishlist = () => getStoredData("wishlistItems", []);

// ✅ Backend API URL (Adjust for local or production)
const API_URL = process.env.REACT_APP_API_URL || "https://hedj.onrender.com";

export const ShopContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [wishlistItems, setWishlistItems] = useState(getDefaultWishlist());
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  // ✅ Save Cart & Wishlist to localStorage on changes
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
  }, [cartItems, wishlistItems]);

  // ✅ Get Total Cart Amount
  const getTotalCartAmount = () =>
    Object.values(cartItems).reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

  // ✅ Add Item to Cart
  const addToCart = useCallback((item) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[item.id]) {
        newCart[item.id].quantity += 1;
      } else {
        newCart[item.id] = { ...item, quantity: 1 };
      }
      return newCart;
    });

    // 🔹 Save to Backend
    axios.post(`${API_URL}/api/cart/add`, { item }).catch(console.error);
  }, []);

  // ✅ Remove Item from Cart
  const removeFromCart = useCallback((itemId) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId].quantity > 1) {
        newCart[itemId].quantity -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });

    // 🔹 Remove from Backend
    axios.delete(`${API_URL}/api/cart/${itemId}`).catch(console.error);
  }, []);

  // ✅ Add Item to Wishlist (Avoid Duplicates)
  const addToWishlist = useCallback((item) => {
    setWishlistItems((prev) => {
      if (!prev.some((wishlistItem) => wishlistItem.id === item.id)) {
        return [...prev, item];
      }
      return prev;
    });

    // 🔹 Save to Backend
    axios.post(`${API_URL}/api/wishlist`, { item }).catch(console.error);
  }, []);

  // ✅ Remove Item from Wishlist
  const removeFromWishlist = useCallback((itemId) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));

    // 🔹 Remove from Backend
    axios.delete(`${API_URL}/api/wishlist/${itemId}`).catch(console.error);
  }, []);

  // ✅ Checkout & Clear Cart
  const checkout = useCallback(() => {
    setPurchaseHistory([...purchaseHistory, ...Object.values(cartItems)]);
    setCartItems(getDefaultCart());

    // 🔹 Send Purchase Data to Backend
    axios.post(`${API_URL}/api/checkout`, { cartItems }).catch(console.error);
  }, [cartItems]);

  // ✅ Context Value (Memoized for Optimization)
  const contextValue = {
    cartItems,
    wishlistItems,
    purchaseHistory,
    addToCart,
    removeFromCart,
    addToWishlist,
    removeFromWishlist,
    getTotalCartAmount,
    checkout,
  };

  return (
    <ShopContext.Provider value={contextValue}>{children}</ShopContext.Provider>
  );
};
