import { useState, useCallback } from "react";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";

const API_URL =
  process.env.REACT_APP_API_URL ??
  (window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://hedj.onrender.com");


export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        const response = await axios.post(
          `${API_URL}/api/users/login`,
          { email, password },
          {
            withCredentials: true, // ✅ Allows backend to set cookies
            headers: { "Content-Type": "application/json" },
          }
        );

        const { token, user } = response.data;

        if (token && user) {
          // ✅ Store token & user in localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          // ✅ Set Authorization header globally
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // ✅ Dispatch login success
          dispatch({ type: "LOGIN_SUCCESS", payload: user });

          setSuccessMessage("Login successful");
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (error) {
        console.error("Login error:", error);
        setErrorMessage(
          error.response?.data?.message || "Login failed. Please try again."
        );
        dispatch({ type: "AUTH_ERROR" });
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, dispatch]
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    errorMessage,
    successMessage,
    isLoading,
    handleLogin,
  };
};
