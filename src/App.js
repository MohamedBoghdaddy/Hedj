import React, { useState } from "react"; // Ensure imports are at the top
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavBar from "./Components/Homepage/NavBar";
import Home from "./Components/Homepage/Home";
import Slideshow from "./Components/Homepage/Slideshow";
import Footer from "./Components/Homepage/Footer";
// import Dashboard from "./Components/dashboard/Dashboard";
import Profile from "./Components/dashboard/profile";
import Contents from "./Components/dashboard/contents";
import AppointmentList from "./Components/dashboard/AppointmentList";
import Cart from "./Components/Products/cart";
import Favorites from "./Components/Products/Favorites";
import Contact from "./Components/Contact/contact";
import Kitchen from "./Components/Products/Kitchen";
import Bedrooms from "./Components/Products/Bedrooms";
import Products from "./Components/Products/Products";
import Signup from "./Components/Loginsystem/Signup";
import Login from "./Components/Loginsystem/Login";
import Kitcard from "./Components/Products/Kitchen"; // Import the modified Kitcard component

// Ensure cart and addToCart are defined at the top level
const App = () => {
  const [cart, setCart] = useState([]); // Initialize empty cart state

  // Define addToCart function to update the cart state
  const addToCart = (item) => {
    setCart((prevCart) => [...prevCart, item]);
  };

  const WithNavBar = ({ children }) => (
    <>
      <NavBar />
      {children}
    </>
  );


  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <WithNavBar>
              <Slideshow />
              <Home />
              <Footer />
            </WithNavBar>
          }
        />
        <Route
          path="/dashboard"
          element={
            <WithNavBar>
              {/* <Dashboard /> */}
              <Profile />
              <Contents />
              <AppointmentList />
            </WithNavBar>
          }
        />
        <Route
          path="/Products"
          element={
            <WithNavBar>
              <Products addToCart={addToCart} />
            </WithNavBar>
          }
        />
        <Route
          path="/Bedrooms"
          element={
            <WithNavBar>
              <Bedrooms />
            </WithNavBar>
          }
        />
        <Route
          path="/Kitchen"
          element={
            <WithNavBar>
              <Kitchen />
            </WithNavBar>
          }
        />
        <Route
          path="/cart"
          element={
            <WithNavBar>
              <Cart cart={cart} />
            </WithNavBar>
          }
        />
        <Route
          path="/cart"
          element={
            <WithNavBar>
              <Kitcard cart={cart} />
            </WithNavBar>
          }
        />
        <Route
          path="/Favorites"
          element={
            <WithNavBar>
              <Favorites />
            </WithNavBar>
          }
        />
        <Route
          path="/contact"
          element={
            <WithNavBar>
              <Contact />
            </WithNavBar>
          }
        />
        <Route
          path="/Login"
          element={
            <WithNavBar>
              <Login />
            </WithNavBar>
          }
        />
        <Route
          path="/Signup"
          element={
            <WithNavBar>
              <Signup />
            </WithNavBar>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
