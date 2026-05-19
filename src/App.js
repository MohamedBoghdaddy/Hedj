import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "./context/AuthContext";
import { AdminShell } from "./Components/AdminShell";

// Public pages
import Home from "./Components/Homepage/Home";
import Wishlist from "./Components/Products/wishlist";
import PremiumProductDetail from "./Pages/ProductDetail";
import CartCheckout from "./Pages/CartCheckout";
import PremiumContact from "./Pages/Contact";

// Auth
import Signup from "./Components/Loginsystem/Signup";
import Login from "./Components/Loginsystem/Login";

// Admin pages
import Dashboard from "./Components/dashboard/Dashboard";
import Setting from "./Components/dashboard/Setting";
import Customers from "./Components/dashboard/CustomersList";
import Leads from "./Components/dashboard/Leads";
import AdminProducts from "./Pages/AdminProducts";
import Quotes from "./Components/dashboard/Quotes";
import OrderDetail from "./Components/dashboard/OrderDetail";
import CustomerDetail from "./Components/dashboard/CustomerDetail";
import AdminOrdersPipeline from "./Pages/AdminOrdersPipeline";
import AdminAnalytics from "./Pages/AdminAnalytics";
import AdminEmployees from "./Pages/AdminEmployees";
import AdminEmailOutbox from "./Pages/AdminEmailOutbox";
import AdminERPOverview from "./Pages/AdminERPOverview";
import AdminERPApps from "./Pages/AdminERPApps";
import AdminERPSchema from "./Pages/AdminERPSchema";
import AdminERPHierarchy from "./Pages/AdminERPHierarchy";
import AdminERPWorkflows from "./Pages/AdminERPWorkflows";
import AdminERPApprovals from "./Pages/AdminERPApprovals";
import ProductCollections from "./Pages/ProductCollections";
import VirtualShowroom from "./Pages/VirtualShowroom";
import CustomerDashboard from "./Pages/CustomerDashboard";
import StaticPlaceholder from "./Pages/StaticPlaceholder";

const AdminRoute = ({ children }) => {
  const { state } = useAuthContext();
  const location = useLocation();
  const role = state.user?.role;

  if (state.loading) return null;
  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (role !== "admin" && role !== "employee") {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const adminPage = (page, shellProps = {}) => (
    <AdminRoute>
      <AdminShell
        active={shellProps.active}
        title={shellProps.title}
        subtitle={shellProps.subtitle}
      >
        {page}
      </AdminShell>
    </AdminRoute>
  );
  const adminStandalonePage = (page) => <AdminRoute>{page}</AdminRoute>;

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Routes>

        {/* ── Public Routes ── */}
        <Route path="/" element={<Home />} />

        {/* Collections */}
        <Route path="/collections" element={<ProductCollections />} />
        <Route path="/collections/kitchens" element={<ProductCollections />} />
        <Route path="/collections/bedrooms" element={<ProductCollections />} />
        <Route path="/collections/outdoor" element={<ProductCollections />} />
        <Route path="/collections/complements" element={<ProductCollections />} />

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
        <Route path="/Products" element={<Navigate to="/products" replace />} />
        <Route path="/products/:slug" element={<PremiumProductDetail />} />

        {/* Commerce */}
        <Route path="/cart" element={<CartCheckout />} />
        <Route path="/checkout" element={<CartCheckout />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/contact" element={<PremiumContact />} />
        <Route path="/virtual-showroom" element={<VirtualShowroom />} />

        {/* Static / legal pages */}
        <Route path="/privacy" element={<StaticPlaceholder pageKey="privacy" />} />
        <Route path="/terms" element={<StaticPlaceholder pageKey="terms" />} />
        <Route path="/shipping" element={<StaticPlaceholder pageKey="shipping" />} />
        <Route path="/sustainability" element={<StaticPlaceholder pageKey="sustainability" />} />

        {/* ── Auth Routes ── */}
        <Route path="/Login" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />

        {/* ── Customer Dashboard ── */}
        <Route path="/dashboard" element={<CustomerDashboard />} />

        {/* ── Admin / ERP Routes ── */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/admin/dashboard"
          element={adminPage(<Dashboard />, {
            active: "Overview",
            title: "Admin Dashboard",
            subtitle: "Revenue, orders, stock alerts, and daily operating signals.",
          })}
        />
        <Route path="/admin/orders" element={adminStandalonePage(<AdminOrdersPipeline />)} />
        <Route
          path="/admin/orders/:orderId"
          element={adminPage(<OrderDetail />, { active: "Orders", title: "Order Detail" })}
        />
        <Route
          path="/admin/customers"
          element={adminPage(<Customers />, { active: "Customers", title: "Customers" })}
        />
        <Route
          path="/admin/customers/:customerId"
          element={adminPage(<CustomerDetail />, {
            active: "Customers",
            title: "Customer Detail",
          })}
        />
        <Route
          path="/admin/leads"
          element={adminPage(<Leads />, { active: "Leads", title: "Leads" })}
        />
        <Route
          path="/admin/quotes"
          element={adminPage(<Quotes />, { active: "Quotes", title: "Quotes" })}
        />
        <Route path="/admin/analytics" element={adminStandalonePage(<AdminAnalytics />)} />
        <Route path="/admin/employees" element={adminStandalonePage(<AdminEmployees />)} />
        <Route path="/admin/emails" element={adminStandalonePage(<AdminEmailOutbox />)} />
        <Route path="/admin/products" element={adminStandalonePage(<AdminProducts />)} />
        <Route
          path="/admin/settings"
          element={adminPage(<Setting />, { active: "Settings", title: "Settings" })}
        />
        <Route path="/admin/reports" element={adminStandalonePage(<AdminAnalytics />)} />
        <Route path="/admin/erp" element={<Navigate to="/admin/erp/overview" replace />} />
        <Route path="/admin/erp/overview" element={adminStandalonePage(<AdminERPOverview />)} />
        <Route path="/admin/erp/apps" element={adminStandalonePage(<AdminERPApps />)} />
        <Route path="/admin/erp/schema" element={adminStandalonePage(<AdminERPSchema />)} />
        <Route path="/admin/erp/hierarchy" element={adminStandalonePage(<AdminERPHierarchy />)} />
        <Route path="/admin/erp/workflow" element={adminStandalonePage(<AdminERPWorkflows />)} />
        <Route path="/admin/erp/workflows" element={<Navigate to="/admin/erp/workflow" replace />} />
        <Route path="/admin/erp/approvals" element={adminStandalonePage(<AdminERPApprovals />)} />

        {/* Legacy admin paths */}
        <Route path="/Setting" element={<Navigate to="/admin/settings" replace />} />
        <Route path="/Settings" element={<Navigate to="/admin/settings" replace />} />
        <Route path="/Reports" element={<Navigate to="/admin/reports" replace />} />
        <Route path="/Profile" element={<Navigate to="/admin/customers" replace />} />
        <Route path="/Employees" element={<Navigate to="/admin/employees" replace />} />
        <Route path="/Customers" element={<Navigate to="/admin/customers" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
