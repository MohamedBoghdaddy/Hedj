// import { createContext, useEffect, useState } from "react";
// import { Images } from "../Assets/Images";

// export const ShopContext = createContext(null);

// const getDefaultCart = () => {
//   let cart = {};
//   for (let i = 1; i < Images.length + 1; i++) {
//     cart[i] = 0;
//   }
//   return cart;
// };

// export const ShopContextProvider = (props) => {
//   const [cartItems, setCartItems] = useState(getDefaultCart());

//   const getTotalCartAmount = () => {
//     let totalAmount = 0;
//     for (const item in cartItems) {
//       if (cartItems[item] > 0) {
//         let itemInfo = Images.find((product) => product.id === Number(item));
//         totalAmount += cartItems[item] * itemInfo.price;
//       }
//     }
//     return totalAmount;
//   };

//   const addToCart = (itemId) => {
//     setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
//   };

//   const removeFromCart = (itemId) => {
//     setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
//   };

//   const updateCartItemCount = (newAmount, itemId) => {
//     setCartItems((prev) => ({ ...prev, [itemId]: newAmount }));
//   };

//   const checkout = () => {
//     setCartItems(getDefaultCart());
//   };

//   const contextValue = {
//     cartItems,
//     addToCart,
//     updateCartItemCount,
//     removeFromCart,
//     getTotalCartAmount,
//     checkout,
//   };

//   return (
//     <ShopContext.Provider value={contextValue}>
//       {props.children}
//     </ShopContext.Provider>
//   );
// };
