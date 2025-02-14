import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import NavBar from "./Components/Homepage/NavBar";
import Mininavbar from "./Components/Homepage/Mininavbar";
import Home from "./Components/Homepage/Home";
import Slideshow from "./Components/Homepage/Slideshow";
import Footer from "./Components/Homepage/Footer";
import Profile from "./Components/dashboard/Sidebar";
import Cart from "./Components/Products/cart";
import Wishlist from "./Components/Products/wishlist";
import Contact from "./Components/Contact/contact";
import Bedrooms from "./Components/Products/Bedrooms";
import Products from "./Components/Products/Products";
import Signup from "./Components/Loginsystem/Signup";
import Login from "./Components/Loginsystem/Login";
import Kitchen from "./Components/Products/Kitchen";
import Sidebar from "./Components/dashboard/Sidebar";
import Setting from "./Components/dashboard/Setting";
import Reports from "./Components/dashboard/Report";
import Employees from "./Components/dashboard/EmployeeList";
import Customers from "./Components/dashboard/CustomersList";
import Dashboard from "./Components/dashboard/Dashboard";
import DayComplement from "./Components/Products/DayComplement";
import NightComplement from "./Components/Products/NighComplement";
import Outdoor from "./Components/Products/Outdoor";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
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
              <Sidebar />
              <Dashboard />
              <Footer />
            </>
          }
        />
        <Route
          path="/Setting"
          element={
            <>
              <ToastContainer />
              <Mininavbar />
              <Sidebar />
              <Setting />
              <Footer />
            </>
          }
        />
        <Route
          path="/Reports"
          element={
            <>
              <Mininavbar />
              <Sidebar />
              <Reports />
              <Footer />
            </>
          }
        />
        <Route
          path="/Profile"
          element={
            <>
              <Mininavbar />
              <Sidebar />
              <Profile />
              <Footer />
            </>
          }
        />
        <Route
          path="/Employees"
          element={
            <>
              <Mininavbar />
              <Sidebar />
              <Employees />
              <Footer />
            </>
          }
        />
        <Route
          path="/Customers"
          element={
            <>
              <Mininavbar />
              <Sidebar />
              <Customers />
              <Footer />
            </>
          }
        />
        <Route
          path="/Settings"
          element={
            <>
              <Mininavbar />
              <Sidebar />
              <Setting />
              <Footer />
            </>
          }
        />
        <Route
          path="/Products"
          element={
            <>
              <Mininavbar />
              <Sidebar />
              <Products />
              <Footer />
            </>
          }
        />
        <Route
          path="/Bedroom"
          element={
            <>
              <Mininavbar />
              <Bedrooms />
              <Footer />
            </>
          }
        />
        <Route
          path="/NightComplement"
          element={
            <>
              <Mininavbar />
              <NightComplement />
              <Footer />
            </>
          }
        />
        <Route
          path="/DayComplement"
          element={
            <>
              <Mininavbar />
              <DayComplement />
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
          path="/Outdoor"
          element={
            <>
              <Mininavbar />
              <Outdoor />
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
          path="/wishlist"
          element={
            <>
              <Mininavbar />
              <Wishlist />
              <Footer />
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
