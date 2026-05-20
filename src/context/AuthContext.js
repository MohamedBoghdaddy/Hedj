import {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import axios from "axios";
import { setAxiosAuthToken } from "../services/authHeaders";

const API_URL =
  process.env.REACT_APP_API_URL ??
  (window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://hedj.onrender.com");

const AUTH_CHECK_TIMEOUT_MS = 10000;
const DEBUG_AUTH_TIMING = process.env.REACT_APP_DEBUG_AUTH_TIMING === "true";

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const clearStoredAuth = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  setAxiosAuthToken(null);
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
    case "USER_LOADED":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case "LOGOUT_SUCCESS":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case "AUTH_ERROR":
      return { ...state, user: null, isAuthenticated: false, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const checkAuth = useCallback(async () => {
    if (state.isAuthenticated || !state.loading) return;

    const startedAt = performance.now();
    if (DEBUG_AUTH_TIMING) console.time("hedj-auth-check");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch({ type: "AUTH_ERROR" });
        return;
      }

      const response = await axios.get(`${API_URL}/api/users/checkAuth`, {
        timeout: AUTH_CHECK_TIMEOUT_MS,
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      const { user } = response.data;
      if (!user) {
        clearStoredAuth();
        dispatch({ type: "AUTH_ERROR" });
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));
      setAxiosAuthToken(token);
      dispatch({ type: "USER_LOADED", payload: user });
    } catch (error) {
      console.error("Auth check failed", error);
      clearStoredAuth();
      dispatch({ type: "AUTH_ERROR" });
    } finally {
      if (DEBUG_AUTH_TIMING) {
        console.info(`hedj-auth-check-ms=${Math.round(performance.now() - startedAt)}`);
        console.timeEnd("hedj-auth-check");
      }
    }
  }, [state.isAuthenticated, state.loading]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        setAxiosAuthToken(storedToken);
        dispatch({ type: "LOGIN_SUCCESS", payload: user });
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        clearStoredAuth();
        dispatch({ type: "AUTH_ERROR" });
      }
    } else {
      checkAuth();
    }
  }, [checkAuth]);

  const logout = useCallback(() => {
    clearStoredAuth();
    dispatch({ type: "LOGOUT_SUCCESS" });
  }, []);

  const contextValue = useMemo(
    () => ({ state, dispatch, logout }),
    [state, logout],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
