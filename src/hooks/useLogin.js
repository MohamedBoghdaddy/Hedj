import { useState, useCallback } from "react";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";
import { setAxiosAuthToken } from "../services/authHeaders";

const API_URL =
  process.env.REACT_APP_API_URL ??
  (window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://hedj.onrender.com");

const AUTH_TIMEOUT_MS = 15000;
const DEBUG_AUTH_TIMING = process.env.REACT_APP_DEBUG_AUTH_TIMING === "true";

const getLoginErrorMessage = (error) => {
  if (error.code === "ECONNABORTED") {
    return "Login is taking too long. Please try again in a moment.";
  }

  if (error.response?.status === 503) {
    return (
      error.response?.data?.message ||
      "The secure server is starting. Please try again shortly."
    );
  }

  return error.response?.data?.message || "Login failed. Please try again.";
};

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
      if (isLoading) return;

      const startedAt = performance.now();
      if (DEBUG_AUTH_TIMING) console.time("hedj-login-submit");

      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        const normalizedEmail = email.trim().toLowerCase();
        const requestStartedAt = performance.now();
        if (DEBUG_AUTH_TIMING) console.time("hedj-login-api");

        const response = await axios.post(
          `${API_URL}/api/users/login`,
          { email: normalizedEmail, password },
          {
            timeout: AUTH_TIMEOUT_MS,
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          },
        );

        if (DEBUG_AUTH_TIMING) {
          console.timeEnd("hedj-login-api");
          console.info(`hedj-login-api-ms=${Math.round(performance.now() - requestStartedAt)}`);
        }

        const { token, user } = response.data;

        if (!token || !user) {
          throw new Error("Unexpected response format");
        }

        const stateStartedAt = performance.now();
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setAxiosAuthToken(token);
        dispatch({ type: "LOGIN_SUCCESS", payload: user });

        if (DEBUG_AUTH_TIMING) {
          console.info(`hedj-login-state-ms=${Math.round(performance.now() - stateStartedAt)}`);
        }

        setSuccessMessage("Login successful");
      } catch (error) {
        console.error("Login error:", error);
        setErrorMessage(getLoginErrorMessage(error));
        dispatch({ type: "AUTH_ERROR" });
      } finally {
        setIsLoading(false);
        if (DEBUG_AUTH_TIMING) {
          console.info(`hedj-login-total-ms=${Math.round(performance.now() - startedAt)}`);
          console.timeEnd("hedj-login-submit");
        }
      }
    },
    [dispatch, email, isLoading, password],
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
