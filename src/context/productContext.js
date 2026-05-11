import { createContext, useState, useEffect, useCallback } from "react";
import { commerceApi } from "../services/api";

export const ShopContext = createContext(null);

const getStoredData = (key, defaultValue) => {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : defaultValue;
  } catch (error) {
    console.error(`Error parsing localStorage data for ${key}:`, error);
    return defaultValue;
  }
};

const getDefaultCart = () => getStoredData("cartItems", {});
const getDefaultWishlist = () => getStoredData("wishlistItems", []);

export const ShopContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [wishlistItems, setWishlistItems] = useState(getDefaultWishlist());
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
  }, [cartItems, wishlistItems]);

  const getTotalCartAmount = () =>
    Object.values(cartItems).reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );

  const addToCart = useCallback(async (item) => {
    const quantityToAdd = Math.max(1, Number(item.quantity || 1));
    const cartItem = { ...item, quantity: quantityToAdd };

    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[item.id]) {
        newCart[item.id].quantity += quantityToAdd;
      } else {
        newCart[item.id] = cartItem;
      }
      return newCart;
    });

    try {
      await commerceApi.addCartItem(cartItem);
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId]?.quantity > 1) {
        newCart[itemId].quantity -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  }, []);

  const addToWishlist = useCallback((item) => {
    setWishlistItems((prev) => {
      if (!prev.some((wishlistItem) => wishlistItem.id === item.id)) {
        return [...prev, item];
      }
      return prev;
    });
  }, []);

  const removeFromWishlist = useCallback((itemId) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const checkout = useCallback(
    async (orderDetails = {}) => {
      const items = Object.values(cartItems);
      if (items.length === 0) return null;

      const result = await commerceApi.checkout({
        ...orderDetails,
        items,
      });

      setPurchaseHistory((prev) => [...prev, ...items]);
      setCartItems({});
      localStorage.setItem("cartItems", JSON.stringify({}));
      return result?.order || result;
    },
    [cartItems]
  );

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
