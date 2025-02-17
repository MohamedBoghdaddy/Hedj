import {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import axios from "axios";


const API_URL =
  process.env.REACT_APP_API_URL ??
  (window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://hedj.onrender.com");

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
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
    if (!state.isAuthenticated && state.loading) {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          // ✅ Validate user session
          const response = await axios.get(`${API_URL}/api/users/checkAuth`, {
            withCredentials: true, // ✅ Send cookies
            headers: { Authorization: `Bearer ${token}` },
          });

          const { user } = response.data;

          if (user) {
            dispatch({ type: "USER_LOADED", payload: user });

            // ✅ Store user data in localStorage
            localStorage.setItem("user", JSON.stringify(user));

            // ✅ Ensure Authorization header is set
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          } else {
            dispatch({ type: "AUTH_ERROR" });
          }
        } else {
          dispatch({ type: "AUTH_ERROR" });
        }
      } catch (error) {
        console.error("Auth check failed", error);
        dispatch({ type: "AUTH_ERROR" });
      }
    }
  }, [state.isAuthenticated, state.loading]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        dispatch({ type: "LOGIN_SUCCESS", payload: user });
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${storedToken}`;
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        dispatch({ type: "AUTH_ERROR" });
      }
    } else {
      checkAuth();
    }
  }, [checkAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    axios.defaults.headers.common["Authorization"] = null;
    dispatch({ type: "LOGOUT_SUCCESS" });
  }, []);

  const contextValue = useMemo(
    () => ({ state, dispatch, logout }),
    [state, logout]
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
