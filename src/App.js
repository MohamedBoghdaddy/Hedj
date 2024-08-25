import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavBar from "./Components/Homepage/NavBar";
import Mininavbar from "./Components/Homepage/Mininavbar";
import Home from "./Components/Homepage/Home";
import Slideshow from "./Components/Homepage/Slideshow";
import Footer from "./Components/Homepage/Footer";
import Profile from "./Components/dashboard/profile";
import Contents from "./Components/dashboard/contents";
import Cart from "./Components/Products/cart";
import Wishlist from "./Components/Products/wishlist";
import Contact from "./Components/Contact/contact";
import Bedrooms from "./Components/Products/Bedrooms";
import { ProductsDropdown } from "./Components/Products/Products";
import Signup from "./Components/Loginsystem/Signup";
import Login from "./Components/Loginsystem/Login";
import Kitchen from "./Components/Products/Kitchen";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<main />} /> */}
        <Route
          path="/"
          element={
            <>
              <NavBar />
              <Slideshow />
              <Home />
              <Footer />
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            <>
              <Mininavbar />
              <Profile />
              <Contents />
            </>
          }
        />
        <Route
          path="/Products"
          element={
            <>
              <Mininavbar />
              <ProductsDropdown />
              <Footer />
            </>
          }
        />
        <Route
          path="/Bedrooms"
          element={
            <>
              <Mininavbar />
              <Bedrooms />
              <Footer />
            </>
          }
        />
        <Route
          path="/Kitchen"
          element={
            <>
              <Mininavbar />
              <Kitchen />
              <Footer />
            </>
          }
        />
        <Route
          path="/cart"
          element={
            <>
              <Mininavbar />
              <Cart />
              <Footer />
            </>
          }
        />
        <Route
          path="/cart"
          element={
            <>
              {" "}
              <Mininavbar />
              <Cart />
            </>
          }
        />
        <Route
          path="/wishlist"
          element={
            <>
              <Mininavbar />
              <Wishlist />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <Mininavbar />
              <Contact />
              <Footer />
            </>
          }
        />
        <Route
          path="/Login"
          element={
            <>
              <Mininavbar />
              <Login />
              <Footer />
            </>
          }
        />
        <Route
          path="/Signup"
          element={
            <>
              <Mininavbar />
              <Signup />
              <Footer />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
