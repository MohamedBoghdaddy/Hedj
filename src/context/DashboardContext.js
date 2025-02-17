import {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useAuthContext } from "./AuthContext";
import { toast } from "react-toastify";

// ✅ Define API Base URL (Uses Environment Variable or Defaults to Render Backend)

const API_URL =
  process.env.REACT_APP_API_URL ??
  (window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://hedj.onrender.com");

// ✅ Create Context
export const DashboardContext = createContext();

// ✅ Initial State
const initialState = {
  analytics: null,
  settings: null,
  products: [],
  customers: [],
  employees: [],
  admins: [],
  profile: null,
  reports: [],
  loading: true,
  error: null,
};

// ✅ Reducer Function
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_SUCCESS":
      return { ...state, ...action.payload, loading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "UPDATE_PROFILE":
      return { ...state, profile: action.payload };
    default:
      return state;
  }
};

// ✅ Provider Component
export const DashboardProvider = ({ children }) => {
  const { state: authState } = useAuthContext();
  const { user, isAuthenticated } = authState;
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const [chartData, setChartData] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Set Global Axios Authorization Header
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  // ✅ Fetch Dashboard Data
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const [
        analyticsRes,
        settingsRes,
        productsRes,
        customersRes,
        employeesRes,
        adminsRes,
        profileRes,
      ] = await Promise.allSettled([
        axios.get(`${API_URL}/api/analytics`, { withCredentials: true }),
        axios.get(`${API_URL}/api/settings`, { withCredentials: true }),
        axios.get(`${API_URL}/api/products`, { withCredentials: true }),
        axios.get(`${API_URL}/api/users/filter?role=customer`, {
          withCredentials: true,
        }),
        axios.get(`${API_URL}/api/users/filter?role=employee`, {
          withCredentials: true,
        }),
        axios.get(`${API_URL}/api/users/filter?role=admin`, {
          withCredentials: true,
        }),
        user?._id
          ? axios.get(`${API_URL}/api/users/${user._id}`, {
              withCredentials: true,
            })
          : Promise.resolve({ status: "fulfilled", value: { data: null } }),
      ]);

      dispatch({
        type: "FETCH_SUCCESS",
        payload: {
          analytics:
            analyticsRes.status === "fulfilled"
              ? analyticsRes.value.data
              : null,
          settings:
            settingsRes.status === "fulfilled" ? settingsRes.value.data : null,
          products:
            productsRes.status === "fulfilled" ? productsRes.value.data : [],
          customers:
            customersRes.status === "fulfilled" ? customersRes.value.data : [],
          employees:
            employeesRes.status === "fulfilled" ? employeesRes.value.data : [],
          admins: adminsRes.status === "fulfilled" ? adminsRes.value.data : [],
          profile:
            profileRes.status === "fulfilled" ? profileRes.value.data : null,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      dispatch({
        type: "FETCH_ERROR",
        payload: error.response?.data?.message || "Failed to load dashboard",
      });
    }
  }, [isAuthenticated, user]);

  // ✅ Fetch Chart Data (Sales Analytics)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/analytics`, {
          withCredentials: true,
        });
        setChartData({
          series: [{ name: "Sales", data: data.salesTrend }],
          options: {
            chart: { type: "line" },
            xaxis: { categories: data.salesMonths },
          },
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchStats();
  }, []);

  // ✅ Fetch Profile Information
  const fetchProfile = useCallback(async () => {
    try {
      if (user?._id) {
        const response = await axios.get(`${API_URL}/api/users/${user._id}`, {
          withCredentials: true,
        });
        dispatch({ type: "UPDATE_PROFILE", payload: response.data });
      }
    } catch (error) {
      toast.error("Failed to load profile.");
      console.error("Error fetching profile:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
    if (user?._id) {
      fetchProfile();
    }
  }, [fetchDashboardData, fetchProfile, user]);

  // ✅ Handle Profile Updates
  const handleUpdateProfile = async (updatedProfile) => {
    try {
      await axios.put(
        `${API_URL}/api/users/update/${user._id}`,
        updatedProfile,
        {
          withCredentials: true,
        }
      );
      dispatch({ type: "UPDATE_PROFILE", payload: updatedProfile });
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error("Error updating profile.");
      console.error("Error updating profile:", error);
    }
  };

  // ✅ Handle File Upload
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setUploadStatus("File uploaded successfully");
      setErrorMessage("");
      fetchProfile(); // Refresh profile after upload
      return response.data.file.filename;
    } catch (error) {
      setUploadStatus("File upload failed");
      setErrorMessage(
        error.response?.data?.error ||
          "An unexpected error occurred during file upload"
      );
      console.error("Error uploading file:", error);
    }
  };

  // ✅ Fetch Reports Separately
  const fetchReports = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/analytics`, {
        withCredentials: true,
      });
      dispatch({ type: "FETCH_SUCCESS", payload: { reports: data } });
    } catch (error) {
      console.error("Error fetching reports:", error);
      dispatch({ type: "FETCH_ERROR", payload: "Failed to load reports" });
    }
  }, []);

  // ✅ Handle Report Download
  const handleDownloadReport = (reportId) => {
    window.open(`${API_URL}/api/analytics/download/${reportId}`, "_blank");
  };

  // ✅ Filter Customers based on Search Query
  const filterCustomers = (customers, searchQuery) => {
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // ✅ Context Value (Memoized for Optimization)
  const contextValue = useMemo(
    () => ({
      state,
      fetchDashboardData,
      fetchProfile,
      fetchReports,
      handleUpdateProfile,
      handleUpload,
      handleDownloadReport,
      filterCustomers,
      chartData,
      uploadStatus,
      errorMessage,
    }),
    [
      state,
      fetchDashboardData,
      fetchProfile,
      fetchReports,
      handleUpdateProfile,
      handleUpload,
      handleDownloadReport,
      chartData,
      uploadStatus,
      errorMessage,
    ]
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// ✅ Prop Types Validation
DashboardProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardProvider;
