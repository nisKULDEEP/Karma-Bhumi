import axios from "axios";
import { API_BASE_URL } from "./base-url";

// Create a flag to track if we're currently checking auth
let isCheckingAuth = false;

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for handling errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API error interceptor triggered:");
    console.log("Status code:", error.response?.status);
    console.log("Error response data:", error.response?.data);
    console.log("Original error:", error);
    
    // Extract error message from the response if available
    if (error.response?.data) {
      // Set the error message and code from the API response
      error.message = error.response.data.message || error.message;
      error.errorCode = error.response.data.errorCode;
      
      console.log("After modification - error.message:", error.message);
      console.log("After modification - error.errorCode:", error.errorCode);
      
      // Store field-specific validation errors if they exist
      if (error.response.data.errors) {
        error.validationErrors = error.response.data.errors;
      }
    }
    
    // Handle unauthorized errors (401)
    if (error.response?.status === 401) {
      // Check if it's a permissions error by looking at the error code or message
      const isPermissionError = 
        error.errorCode === "ACCESS_UNAUTHORIZED" || 
        error.message?.includes("permissions") ||
        error.message?.includes("permission");
      
      // Only redirect for authentication errors, not permission errors
      if (!isPermissionError && !isCheckingAuth && window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    
    // Special handling for forbidden errors (403)
    if (error.response?.status === 403) {
      console.log("Handling 403 Forbidden error");
      // No redirect needed for permission errors
    }
    
    return Promise.reject(error);
  }
);

// Add a request interceptor to set/unset the isCheckingAuth flag
API.interceptors.request.use(
  (config) => {
    // Set the flag when checking authentication
    if (config.url === '/user/current') {
      isCheckingAuth = true;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add another response interceptor to reset the isCheckingAuth flag
API.interceptors.response.use(
  (response) => {
    if (response.config.url === '/user/current') {
      isCheckingAuth = false;
    }
    return response;
  },
  (error) => {
    if (error.config?.url === '/user/current') {
      isCheckingAuth = false;
    }
    return Promise.reject(error);
  }
);

export default API;
