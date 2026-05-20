import { API_URL } from "./api";
import { getAuthHeaders } from "./authHeaders";

export const requestBackendJson = async (path, options = {}) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs || 10000);

  const headers = getAuthHeaders({
    "Content-Type": "application/json",
    ...(options.headers || {}),
  });

  try {
    const response = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      ...options,
      signal: controller.signal,
      headers,
      body:
        options.body &&
        typeof options.body !== "string" &&
        !(options.body instanceof FormData)
          ? JSON.stringify(options.body)
          : options.body,
    });

    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const error = new Error(
        payload?.message || payload?.error || `Request failed: ${response.status}`,
      );
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("Request timed out. Please try again.");
      timeoutError.status = 408;
      throw timeoutError;
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
};
