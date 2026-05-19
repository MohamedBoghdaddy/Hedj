import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "./context/AuthContext";

// Public layout
import NavBar from "./Components/Homepage/NavBar";
import Mininavbar from "./Components/Homepage/Mininavbar";
import Footer from "./Components/Homepage/Footer";

// Public pages
import Home from "./Components/Homepage/Home";
import Slideshow from "./Components/Homepage/Slideshow";
import ProductDetail from "./Components/Products/ProductDetail";
import Wishlist from "./Components/Products/wishlist";
import KitchenCollections from "./Pages/KitchenCollections";
import PremiumProductDetail from "./Pages/ProductDetail";
import CartCheckout from "./Pages/CartCheckout";
import PremiumContact from "./Pages/Contact";

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
import Leads from "./Components/dashboard/Leads";
import AdminProducts from "./Components/dashboard/AdminProducts";
import Quotes from "./Components/dashboard/Quotes";
import OrderDetail from "./Components/dashboard/OrderDetail";
import CustomerDetail from "./Components/dashboard/CustomerDetail";
import AdminOrdersPipeline from "./Pages/AdminOrdersPipeline";
import AdminAnalytics from "./Pages/AdminAnalytics";
import AdminEmployees from "./Pages/AdminEmployees";
import AdminERPOverview from "./Pages/AdminERPOverview";
import AdminERPApps from "./Pages/AdminERPApps";
import AdminERPSchema from "./Pages/AdminERPSchema";
import AdminERPHierarchy from "./Pages/AdminERPHierarchy";
import AdminERPWorkflows from "./Pages/AdminERPWorkflows";
import AdminERPApprovals from "./Pages/AdminERPApprovals";
import ProductCollections from "./Pages/ProductCollections";
import CollectionCategory from "./Pages/CollectionCategory";
import VirtualShowroom from "./Pages/VirtualShowroom";
import CustomerDashboard from "./Pages/CustomerDashboard";
import StaticPlaceholder from "./Pages/StaticPlaceholder";

const AdminRoute = ({ children }) => {
  const { state } = useAuthContext();
  const location = useLocation();
  const role = state.user?.role;

  if (state.loading) return null;
  if (!state.isAuthenticated) {
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }
  if (role !== "admin" && role !== "employee") {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const adminPage = (page) => (
    <AdminRoute>
      <AdminLayout>{page}</AdminLayout>
    </AdminRoute>
  );
  const adminStandalonePage = (page) => <AdminRoute>{page}</AdminRoute>;

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Routes>

        {/* ── Public Routes ── */}
        <Route path="/" element={<><NavBar /><Slideshow /><Home /><Footer /></>} />

        {/* Collections */}
        <Route path="/collections" element={<ProductCollections />} />
        <Route path="/collections/kitchens" element={<KitchenCollections />} />
        <Route path="/collections/bedrooms" element={<CollectionCategory />} />
        <Route path="/collections/outdoor" element={<CollectionCategory />} />
        <Route path="/collections/complements" element={<CollectionCategory />} />

        {/* Legacy collection routes → premium redirects */}
        <Route path="/Kitchen" element={<Navigate to="/collections/kitchens" replace />} />
        <Route path="/Kitchens" element={<Navigate to="/collections/kitchens" replace />} />
        <Route path="/Bedroom" element={<Navigate to="/collections/bedrooms" replace />} />
        <Route path="/Bedrooms" element={<Navigate to="/collections/bedrooms" replace />} />
        <Route path="/Outdoor" element={<Navigate to="/collections/outdoor" replace />} />
        <Route path="/DayComplement" element={<Navigate to="/collections/complements?type=day" replace />} />
        <Route path="/NightComplement" element={<Navigate to="/collections/complements?type=night" replace />} />
        <Route path="/Complements" element={<Navigate to="/collections/complements" replace />} />

        {/* Products */}
        <Route path="/products" element={<ProductCollections />} />
        <Route path="/Products" element={<ProductCollections />} />
        <Route path="/products/obsidian-kitchen-island" element={<PremiumProductDetail />} />
        <Route path="/products/:slug" element={<><NavBar /><ProductDetail /><Footer /></>} />

        {/* Commerce */}
        <Route path="/cart" element={<CartCheckout />} />
        <Route path="/checkout" element={<CartCheckout />} />
        <Route path="/wishlist" element={<><NavBar /><Wishlist /><Footer /></>} />
        <Route path="/contact" element={<PremiumContact />} />
        <Route path="/virtual-showroom" element={<VirtualShowroom />} />

        {/* Static / legal pages */}
        <Route path="/privacy" element={<StaticPlaceholder pageKey="privacy" />} />
        <Route path="/terms" element={<StaticPlaceholder pageKey="terms" />} />
        <Route path="/shipping" element={<StaticPlaceholder pageKey="shipping" />} />
        <Route path="/sustainability" element={<StaticPlaceholder pageKey="sustainability" />} />

        {/* ── Auth Routes ── */}
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />

        {/* ── Customer Dashboard ── */}
        <Route path="/dashboard" element={<CustomerDashboard />} />

        {/* ── Admin / ERP Routes ── */}
        <Route path="/admin" element={adminPage(<Dashboard />)} />
        <Route path="/admin/dashboard" element={adminPage(<Dashboard />)} />
        <Route path="/admin/orders" element={adminStandalonePage(<AdminOrdersPipeline />)} />
        <Route path="/admin/orders/:orderId" element={adminPage(<OrderDetail />)} />
        <Route path="/admin/customers" element={adminPage(<Customers />)} />
        <Route path="/admin/customers/:customerId" element={adminPage(<CustomerDetail />)} />
        <Route path="/admin/leads" element={adminPage(<Leads />)} />
        <Route path="/admin/quotes" element={adminPage(<Quotes />)} />
        <Route path="/admin/analytics" element={adminStandalonePage(<AdminAnalytics />)} />
        <Route path="/admin/employees" element={adminStandalonePage(<AdminEmployees />)} />
        <Route path="/admin/products" element={adminPage(<AdminProducts />)} />
        <Route path="/admin/settings" element={adminPage(<Setting />)} />
        <Route path="/admin/reports" element={adminStandalonePage(<AdminAnalytics />)} />
        <Route path="/admin/erp" element={adminStandalonePage(<AdminERPOverview />)} />
        <Route path="/admin/erp/apps" element={adminStandalonePage(<AdminERPApps />)} />
        <Route path="/admin/erp/schema" element={adminStandalonePage(<AdminERPSchema />)} />
        <Route path="/admin/erp/hierarchy" element={adminStandalonePage(<AdminERPHierarchy />)} />
        <Route path="/admin/erp/workflows" element={adminStandalonePage(<AdminERPWorkflows />)} />
        <Route path="/admin/erp/approvals" element={adminStandalonePage(<AdminERPApprovals />)} />

        {/* Legacy admin paths */}
        <Route path="/Setting" element={<AdminRoute><><ToastContainer /><Mininavbar /><Sidebar /><Setting /><Footer /></></AdminRoute>} />
        <Route path="/Settings" element={<AdminRoute><><ToastContainer /><Mininavbar /><Sidebar /><Setting /><Footer /></></AdminRoute>} />
        <Route path="/Reports" element={adminPage(<Reports />)} />
        <Route path="/Profile" element={adminPage(<Customers />)} />
        <Route path="/Employees" element={adminPage(<Employees />)} />
        <Route path="/Customers" element={adminPage(<Customers />)} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
