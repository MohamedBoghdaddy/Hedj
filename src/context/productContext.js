import { createContext, useState } from "react";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
  let cart = {};
  return cart;
};

export const ShopContextProvider = (props) => {
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [wishlistItems, setWishlistItems] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  const getTotalCartAmount = () => {
    return Object.values(cartItems).reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const addToCart = (item) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[item.id]) {
        newCart[item.id].quantity += 1;
      } else {
        newCart[item.id] = { ...item, quantity: 1 };
      }
      return newCart;
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId].quantity > 1) {
        newCart[itemId].quantity -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const addToWishlist = (item) => {
    setWishlistItems((prev) => [...prev, item]);
  };

  const removeFromWishlist = (itemId) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const checkout = () => {
    setPurchaseHistory([...purchaseHistory, ...Object.values(cartItems)]);
    setCartItems(getDefaultCart());
  };

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
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};
