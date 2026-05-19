import axios from "axios";

export const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
};

export const setAxiosAuthToken = (token = getStoredToken()) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

export const getAuthHeaders = (headers = {}) => {
  const token = getStoredToken();
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
};

export const withAuth = (config = {}) => ({
  ...config,
  withCredentials: true,
  headers: getAuthHeaders(config.headers),
});
