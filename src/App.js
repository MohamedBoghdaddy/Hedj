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
import Favorites from "./Components/Products/wishlist";
import Contact from "./Components/Contact/contact";
import Kitchen from "./Components/Products/Kitchen";
import Bedrooms from "./Components/Products/Bedrooms";
import Products from "./Components/Products/Products";
import Signup from "./Components/Loginsystem/Signup";
import Login from "./Components/Loginsystem/Login";
import Kitcard from "./Components/Products/Kitchen";
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
              <Footer />
            </>
          }
        />
        <Route
          path="/Products"
          element={
            <>
              <Mininavbar />
              <Products />
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
              <Kitcard />
            </>
          }
        />
        <Route
          path="/wishlist"
          element={
            <>
              <Mininavbar />
              <Favorites />
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
