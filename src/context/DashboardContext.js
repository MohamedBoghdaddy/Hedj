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

// Create Context
export const DashboardContext = createContext();

// Initial State
const initialState = {
  analytics: null,
  settings: null,
  products: [],
  customers: [],
  employees: [],
  profile: null,
  reports: [],
  loading: true,
  error: null,
};

// Reducer Function
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

// Provider Component
export const DashboardProvider = ({ children }) => {
  const { state: authState } = useAuthContext();
  const { user, isAuthenticated } = authState;
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const [chartData, setChartData] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch Dashboard Data
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const [
        analyticsRes,
        settingsRes,
        productsRes,
        customersRes,
        employeesRes,
        reportsRes,
        profileRes,
      ] = await Promise.allSettled([
        axios.get("http://localhost:8000/api/analytics"),
        axios.get("http://localhost:8000/api/settings"),
        axios.get("http://localhost:8000/api/products"),
        axios.get("http://localhost:8000/api/customers"),
        axios.get("http://localhost:8000/api/employees"),
        axios.get("http://localhost:8000/api/reports"),
        user?._id
          ? axios.get(`http://localhost:8000/api/users/${user._id}`)
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
          reports:
            reportsRes.status === "fulfilled" ? reportsRes.value.data : [],
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

  // Fetch sales stats and update chart data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("/api/dashboard/stats");
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

  // Fetch profile information
  const fetchProfile = useCallback(async () => {
    try {
      if (user?._id) {
        const response = await axios.get(
          `http://localhost:8000/api/users/${user._id}`
        );
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

  // Handle profile updates
  const handleUpdateProfile = async (updatedProfile) => {
    try {
      await axios.put(
        `http://localhost:8000/api/users/update/${user._id}`,
        updatedProfile
      );
      dispatch({ type: "UPDATE_PROFILE", payload: updatedProfile });
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error("Error updating profile.");
      console.error("Error updating profile:", error);
    }
  };

  // Handle file upload
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await axios.post(
        "http://localhost:8000/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
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
  const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await axios.post(
        "http://localhost:8000/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data.file.filename; // Return uploaded file path
    } catch (error) {
      throw new Error("Failed to upload photo");
    }
  };
  // ✅ Fetch Reports Separately
  const fetchReports = useCallback(async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/reports");
      dispatch({ type: "FETCH_SUCCESS", payload: { reports: data } });
    } catch (error) {
      console.error("Error fetching reports:", error);
      dispatch({ type: "FETCH_ERROR", payload: "Failed to load reports" });
    }
  }, []);
  // Handle report download
  const handleDownloadReport = (reportId) => {
    window.open(
      `http://localhost:8000/api/reports/download/${reportId}`,
      "_blank"
    );
  };

  // Filter customers based on search query
  const filterCustomers = (customers, searchQuery) => {
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

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
      uploadPhoto,
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

// Prop types validation
DashboardProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardProvider;
