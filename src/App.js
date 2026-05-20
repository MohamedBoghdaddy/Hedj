import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "./context/AuthContext";
import { AdminShell } from "./Components/AdminShell";
import { isStaff, isAdmin, isEmployee } from "./utils/permissions";

// Public pages
import Home from "./Components/Homepage/Home";
import Wishlist from "./Pages/Wishlist";
import PremiumProductDetail from "./Pages/ProductDetail";
import CartCheckout from "./Pages/CartCheckout";
import PremiumContact from "./Pages/Contact";
import SupportPortal from "./Pages/SupportPortal";
import TradeLogin from "./Pages/TradeLogin";
import TradeProgram from "./Pages/TradeProgram";

// Auth
import Signup from "./Components/Loginsystem/Signup";
import Login from "./Components/Loginsystem/Login";

// Admin / staff pages
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
import AdminAttendance from "./Pages/AdminAttendance";
import AdminLeave from "./Pages/AdminLeave";

// Employee self-service pages
import EmployeeDashboard from "./Pages/EmployeeDashboard";
import EmployeeAttendance from "./Pages/EmployeeAttendance";
import EmployeeLeave from "./Pages/EmployeeLeaveRequests";

// Public / customer pages
import ProductCollections from "./Pages/ProductCollections";
import VirtualShowroom from "./Pages/VirtualShowroom";
import CustomerDashboard from "./Pages/CustomerDashboard";
import StaticPlaceholder from "./Pages/StaticPlaceholder";
import AcceptInvite from "./Pages/AcceptInvite";

/**
 * StaffRoute: accessible by admin, super_admin, manager, HR, accountant,
 * operations, and designer roles. Pure employees are redirected to /employee/dashboard.
 * Customers and unauthenticated users are redirected elsewhere.
 */
const StaffRoute = ({ children }) => {
  const { state } = useAuthContext();
  const location = useLocation();

  if (state.loading) return null;

  if (!state.isAuthenticated || !state.user) {
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  if (!isStaff(state.user)) {
    // Customers go to their own dashboard
    return <Navigate to="/dashboard" replace />;
  }

  if (isEmployee(state.user)) {
    // Pure employee role belongs in the employee portal, not the admin shell
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
};

/**
 * EmployeeRoute: accessible by any staff role (employees see their own portal;
 * admins can also visit for preview/debugging).
 */
const EmployeeRoute = ({ children }) => {
  const { state } = useAuthContext();
  const location = useLocation();

  if (state.loading) return null;

  if (!state.isAuthenticated || !state.user) {
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  if (!isStaff(state.user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * AdminRoute: only admin and super_admin.
 * Other staff are redirected to the main admin dashboard.
 */
const AdminRoute = ({ children }) => {
  const { state } = useAuthContext();
  const location = useLocation();

  if (state.loading) return null;

  if (!state.isAuthenticated || !state.user) {
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  if (!isStaff(state.user)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isAdmin(state.user)) {
    // Staff but not admin — redirect to overview (they can see their permitted items)
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

const App = () => {
  // Wraps a page with AdminShell (title bar + sidebar) behind StaffRoute
  const staffPage = (page, shellProps = {}) => (
    <StaffRoute>
      <AdminShell
        active={shellProps.active}
        title={shellProps.title}
        subtitle={shellProps.subtitle}
      >
        {page}
      </AdminShell>
    </StaffRoute>
  );

  // Standalone page without explicit AdminShell wrapper (page manages its own shell)
  const staffStandalonePage = (page) => <StaffRoute>{page}</StaffRoute>;

  // Admin-only pages (only admin/super_admin can reach these)
  const adminOnlyPage = (page, shellProps = {}) => (
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

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
        <Route path="/support" element={<SupportPortal />} />
        <Route path="/client-support" element={<SupportPortal />} />
        <Route path="/trade-login" element={<TradeLogin />} />
        <Route path="/trade-program" element={<TradeProgram />} />
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
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/signup" element={<Signup />} />

        {/* ── Customer Dashboard ── */}
        <Route path="/dashboard" element={<CustomerDashboard />} />

        {/* ── Admin / Staff Overview ── */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/admin/dashboard"
          element={staffPage(<Dashboard />, {
            active: "Overview",
            title: "Dashboard",
            subtitle: "Revenue, orders, stock alerts, and daily operating signals.",
          })}
        />

        {/* ── Orders (staff with orders.viewAll permission) ── */}
        <Route path="/admin/orders" element={staffStandalonePage(<AdminOrdersPipeline />)} />
        <Route
          path="/admin/orders/:orderId"
          element={staffPage(<OrderDetail />, { active: "Orders", title: "Order Detail" })}
        />

        {/* ── Customers (staff with customers.view) ── */}
        <Route
          path="/admin/customers"
          element={staffPage(<Customers />, { active: "Customers", title: "Customers" })}
        />
        <Route
          path="/admin/customers/:customerId"
          element={staffPage(<CustomerDetail />, { active: "Customers", title: "Customer Detail" })}
        />

        {/* ── Leads & Quotes ── */}
        <Route
          path="/admin/leads"
          element={staffPage(<Leads />, { active: "Leads", title: "Leads" })}
        />
        <Route
          path="/admin/quotes"
          element={staffPage(<Quotes />, { active: "Quotes", title: "Quotes" })}
        />

        {/* ── Attendance & Leave ── */}
        <Route path="/admin/attendance" element={staffStandalonePage(<AdminAttendance />)} />
        <Route path="/admin/leave" element={staffStandalonePage(<AdminLeave />)} />

        {/* ── Analytics / Reports (staff with analytics.view) ── */}
        <Route path="/admin/analytics" element={staffStandalonePage(<AdminAnalytics />)} />
        <Route path="/admin/reports"   element={staffStandalonePage(<AdminAnalytics />)} />

        {/* ── Employees (staff with employees.view) ── */}
        <Route path="/admin/employees" element={staffStandalonePage(<AdminEmployees />)} />

        {/* ── Products (staff with products.view) ── */}
        <Route path="/admin/products" element={staffStandalonePage(<AdminProducts />)} />

        {/* ── Email Outbox (staff with emails.view) ── */}
        <Route path="/admin/emails" element={staffStandalonePage(<AdminEmailOutbox />)} />

        {/* ── Settings (admin-only) ── */}
        <Route
          path="/admin/settings"
          element={adminOnlyPage(<Setting />, { active: "Settings", title: "Settings" })}
        />

        {/* ── ERP (staff with erp.view) ── */}
        <Route path="/admin/erp" element={<Navigate to="/admin/erp/overview" replace />} />
        <Route path="/admin/erp/overview"   element={staffStandalonePage(<AdminERPOverview />)} />
        <Route path="/admin/erp/apps"       element={staffStandalonePage(<AdminERPApps />)} />
        <Route path="/admin/erp/schema"     element={staffStandalonePage(<AdminERPSchema />)} />
        <Route path="/admin/erp/hierarchy"  element={staffStandalonePage(<AdminERPHierarchy />)} />
        <Route path="/admin/erp/workflow"   element={staffStandalonePage(<AdminERPWorkflows />)} />
        <Route path="/admin/erp/workflows"  element={<Navigate to="/admin/erp/workflow" replace />} />
        <Route path="/admin/erp/approvals"  element={staffStandalonePage(<AdminERPApprovals />)} />

        {/* ── Employee Self-Service Portal ── */}
        <Route path="/employee" element={<Navigate to="/employee/dashboard" replace />} />
        <Route path="/employee/dashboard"       element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
        <Route path="/employee/attendance"      element={<EmployeeRoute><EmployeeAttendance /></EmployeeRoute>} />
        <Route path="/employee/leave-requests"  element={<EmployeeRoute><EmployeeLeave /></EmployeeRoute>} />
        {/* Legacy leave alias */}
        <Route path="/employee/leave"           element={<Navigate to="/employee/leave-requests" replace />} />

        {/* Legacy admin paths */}
        <Route path="/Setting"   element={<Navigate to="/admin/settings"   replace />} />
        <Route path="/Settings"  element={<Navigate to="/admin/settings"   replace />} />
        <Route path="/Reports"   element={<Navigate to="/admin/reports"    replace />} />
        <Route path="/Profile"   element={<Navigate to="/admin/customers"  replace />} />
        <Route path="/Employees" element={<Navigate to="/admin/employees"  replace />} />
        <Route path="/Customers" element={<Navigate to="/admin/customers"  replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
