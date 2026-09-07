import axios from "axios";

const DEMO_TOKEN = "demo-bypass-token-cohabit-ai";
const API_BASE_URL = import.meta.env?.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8000" : "");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to inject JWT token in every authenticated request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle common API errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const url = error.config?.url || "";
      const isAuthEndpoint = url.includes("/login") || 
                             url.includes("/register") || 
                             url.includes("/forgot-password") || 
                             url.includes("/reset-password");

      // Only redirect on 401 for authenticated session expiry, NOT on login failures or demo mode
      const isDemoToken = localStorage.getItem("token") === DEMO_TOKEN;
      if (error.response.status === 401 && !isAuthEndpoint && !isDemoToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("college");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && currentPath !== "/student-login") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error.response.data || { detail: "An error occurred" });
    }
    return Promise.reject({ detail: "Cannot connect to server. Make sure backend is running." });
  }
);

export default apiClient;
