import  {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import axios from "axios";

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
        const token =
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1] || localStorage.getItem("token");

        if (token) {
          const response = await axios.get(
            `${
              process.env.REACT_APP_API_URL || "http://localhost:4000"
            }/api/users/checkAuth`,
            {
              withCredentials: true,
            }
          );
          const { user } = response.data;
          if (user) {
            dispatch({ type: "USER_LOADED", payload: user });
            // Ensure the token is set for future requests
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            localStorage.setItem("user", JSON.stringify({ token, user }));
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
    if (storedUser) {
      try {
        const { token, user } = JSON.parse(storedUser);
        if (user && token) {
          dispatch({ type: "LOGIN_SUCCESS", payload: user });
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
          checkAuth(); // Fallback to server check if no valid local data
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        dispatch({ type: "AUTH_ERROR" });
      }
    } else {
      checkAuth(); // Check server-side if no user is in local storage
    }
  }, [checkAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    axios.defaults.headers.common["Authorization"] = null;
    dispatch({ type: "LOGOUT_SUCCESS" });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ state, dispatch, logout }),
    [state, logout]
  );

  // Log only if the state changes significantly (optional)
  useEffect(() => {
    if (!state.loading) {
      console.log("AuthProvider state has changed:", state);
    }
  }, [state.isAuthenticated, state.user, state.loading, state]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
