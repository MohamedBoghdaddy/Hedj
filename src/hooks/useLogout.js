import { useCallback } from "react";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";

// ✅ Backend API Base URL (Production & Local)

const API_URL =
  process.env.REACT_APP_API_URL ??
  (window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://hedj.onrender.com");

export const useLogout = () => {
  const { dispatch } = useAuthContext();

  const logout = useCallback(async () => {
    try {
      // ✅ Send Logout Request to Backend
      await axios.post(
        `${API_URL}/api/users/logout`,
        {},
        { withCredentials: true }
      );

      // ✅ Clear Local Storage (Client-side)
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // ✅ Remove Authorization Header for Future Requests
      delete axios.defaults.headers.common["Authorization"];

      // ✅ Dispatch Logout Action to Update State
      dispatch({ type: "LOGOUT_SUCCESS" });

      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error.response?.data || error.message);
    }
  }, [dispatch]);

  return { logout };
};
