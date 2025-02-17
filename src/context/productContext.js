import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const ShopContext = createContext(null);

// ✅ Backend API Base URL

const API_URL =
  process.env.REACT_APP_API_URL ??
  (window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://hedj.onrender.com");

// ✅ Helper function to get stored items from localStorage
const getStoredData = (key, defaultValue) => {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : defaultValue;
  } catch (error) {
    console.error(`Error parsing localStorage data for ${key}:`, error);
    return defaultValue;
  }
};

// ✅ Initialize Cart & Wishlist
const getDefaultCart = () => getStoredData("cartItems", {});
const getDefaultWishlist = () => getStoredData("wishlistItems", []);

// ✅ Shop Context Provider
export const ShopContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [wishlistItems, setWishlistItems] = useState(getDefaultWishlist());
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  // ✅ Save Cart & Wishlist to localStorage when changed
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
  }, [cartItems, wishlistItems]);

  // ✅ Set Global Authorization Header for API Requests
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  // ✅ Get Total Cart Amount
  const getTotalCartAmount = () =>
    Object.values(cartItems).reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

  // ✅ Add Item to Cart
  const addToCart = useCallback(async (item) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[item.id]) {
        newCart[item.id].quantity += 1;
      } else {
        newCart[item.id] = { ...item, quantity: 1 };
      }
      return newCart;
    });

    try {
      await axios.post(
        `${API_URL}/api/cart/add`,
        { item },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  }, []);

  // ✅ Remove Item from Cart
  const removeFromCart = useCallback(async (itemId) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId].quantity > 1) {
        newCart[itemId].quantity -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });

    try {
      await axios.delete(`${API_URL}/api/cart/${itemId}`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  }, []);

  // ✅ Add Item to Wishlist (Avoid Duplicates)
  const addToWishlist = useCallback(async (item) => {
    setWishlistItems((prev) => {
      if (!prev.some((wishlistItem) => wishlistItem.id === item.id)) {
        return [...prev, item];
      }
      return prev;
    });

    try {
      await axios.post(
        `${API_URL}/api/wishlist/add`,
        { item },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error adding item to wishlist:", error);
    }
  }, []);

  // ✅ Remove Item from Wishlist
  const removeFromWishlist = useCallback(async (itemId) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));

    try {
      await axios.delete(`${API_URL}/api/wishlist/remove/${itemId}`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
    }
  }, []);

  // ✅ Checkout & Clear Cart
  const checkout = useCallback(async () => {
    setPurchaseHistory([...purchaseHistory, ...Object.values(cartItems)]);
    setCartItems(getDefaultCart());

    try {
      await axios.post(
        `${API_URL}/api/checkout`,
        { cartItems },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error during checkout:", error);
    }
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
