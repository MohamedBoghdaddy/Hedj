import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Public layout
import NavBar from "./Components/Homepage/NavBar";
import Mininavbar from "./Components/Homepage/Mininavbar";
import Footer from "./Components/Homepage/Footer";

// Public pages
import Home from "./Components/Homepage/Home";
import Slideshow from "./Components/Homepage/Slideshow";
import Kitchen from "./Components/Products/Kitchen";
import Bedrooms from "./Components/Products/Bedrooms";
import Products from "./Components/Products/Products";
import DayComplement from "./Components/Products/DayComplement";
import NightComplement from "./Components/Products/NighComplement";
import Outdoor from "./Components/Products/Outdoor";
import ProductDetail from "./Components/Products/ProductDetail";
import Cart from "./Components/Products/cart";
import Checkout from "./Components/Products/Checkout";
import Wishlist from "./Components/Products/wishlist";
import Contact from "./Components/Contact/contact";

// Auth
import Signup from "./Components/Loginsystem/Signup";
import Login from "./Components/Loginsystem/Login";

// Admin layout
import AdminLayout from "./Components/dashboard/AdminLayout";

// Admin pages
import Dashboard from "./Components/dashboard/Dashboard";
import Sidebar from "./Components/dashboard/Sidebar";
import Setting from "./Components/dashboard/Setting";
import Reports from "./Components/dashboard/Report";
import Employees from "./Components/dashboard/EmployeeList";
import Customers from "./Components/dashboard/CustomersList";
import Orders from "./Components/dashboard/Orders";
import Leads from "./Components/dashboard/Leads";
import Analytics from "./Components/dashboard/Analytics";
import AdminProducts from "./Components/dashboard/AdminProducts";
import Quotes from "./Components/dashboard/Quotes";
import OrderDetail from "./Components/dashboard/OrderDetail";
import CustomerDetail from "./Components/dashboard/CustomerDetail";

const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Routes>

        {/* ── Public Routes ── */}
        <Route path="/" element={<><NavBar /><Slideshow /><Home /><Footer /></>} />
        <Route path="/collections" element={<><NavBar /><Kitchen /><Footer /></>} />
        <Route path="/collections/kitchens" element={<><NavBar /><Kitchen /><Footer /></>} />
        <Route path="/Kitchen" element={<><NavBar /><Kitchen /><Footer /></>} />
        <Route path="/Bedroom" element={<><NavBar /><Bedrooms /><Footer /></>} />
        <Route path="/DayComplement" element={<><NavBar /><DayComplement /><Footer /></>} />
        <Route path="/NightComplement" element={<><NavBar /><NightComplement /><Footer /></>} />
        <Route path="/Outdoor" element={<><NavBar /><Outdoor /><Footer /></>} />
        <Route path="/products" element={<><NavBar /><Products /><Footer /></>} />
        <Route path="/Products" element={<><NavBar /><Products /><Footer /></>} />
        <Route path="/products/:slug" element={<><NavBar /><ProductDetail /><Footer /></>} />
        <Route path="/cart" element={<><NavBar /><Cart /><Footer /></>} />
        <Route path="/checkout" element={<><NavBar /><Checkout /><Footer /></>} />
        <Route path="/wishlist" element={<><NavBar /><Wishlist /><Footer /></>} />
        <Route path="/contact" element={<><NavBar /><Contact /><Footer /></>} />

        {/* ── Auth Routes ── */}
        <Route path="/Login" element={<><Mininavbar /><Login /><Footer /></>} />
        <Route path="/Signup" element={<><Mininavbar /><Signup /><Footer /></>} />

        {/* ── Admin / ERP Routes ── */}
        <Route path="/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/orders" element={<AdminLayout><Orders /></AdminLayout>} />
        <Route path="/admin/orders/:orderId" element={<AdminLayout><OrderDetail /></AdminLayout>} />
        <Route path="/admin/customers" element={<AdminLayout><Customers /></AdminLayout>} />
        <Route path="/admin/customers/:customerId" element={<AdminLayout><CustomerDetail /></AdminLayout>} />
        <Route path="/admin/leads" element={<AdminLayout><Leads /></AdminLayout>} />
        <Route path="/admin/quotes" element={<AdminLayout><Quotes /></AdminLayout>} />
        <Route path="/admin/analytics" element={<AdminLayout><Analytics /></AdminLayout>} />
        <Route path="/admin/employees" element={<AdminLayout><Employees /></AdminLayout>} />
        <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><Setting /></AdminLayout>} />
        <Route path="/admin/reports" element={<AdminLayout><Reports /></AdminLayout>} />

        {/* Legacy admin paths */}
        <Route path="/Setting" element={<><ToastContainer /><Mininavbar /><Sidebar /><Setting /><Footer /></>} />
        <Route path="/Settings" element={<><ToastContainer /><Mininavbar /><Sidebar /><Setting /><Footer /></>} />
        <Route path="/Reports" element={<AdminLayout><Reports /></AdminLayout>} />
        <Route path="/Profile" element={<AdminLayout><Customers /></AdminLayout>} />
        <Route path="/Employees" element={<AdminLayout><Employees /></AdminLayout>} />
        <Route path="/Customers" element={<AdminLayout><Customers /></AdminLayout>} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
