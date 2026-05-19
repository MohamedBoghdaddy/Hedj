import { useCallback } from "react";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";
import { setAxiosAuthToken } from "../services/authHeaders";

const API_URL =
  process.env.REACT_APP_API_URL ??
  (window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://hedj.onrender.com");

export const useLogout = () => {
  const { dispatch } = useAuthContext();

  const logout = useCallback(async () => {
    try {
      await axios.post(
        `${API_URL}/api/users/logout`,
        {},
        { withCredentials: true }
      );
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setAxiosAuthToken(null);
      dispatch({ type: "LOGOUT_SUCCESS" });
    }
  }, [dispatch]);

  return { logout };
};
