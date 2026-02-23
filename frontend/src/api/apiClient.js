import axios from "axios";
import { useNotification } from "../context/NotificationContext";

export const createApiClient = (showNotification) => {
  const client = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  });

  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("adminToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      let errorMessage = "An unexpected error occurred";

      if (error.response) {
        
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          errorMessage = "❌ Unauthorized: Please login again";
          
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
        } else if (status === 403) {
          errorMessage = "❌ Access Denied: You don't have permission for this action";
        } else if (status === 404) {
          errorMessage = data?.message || data?.error || "❌ Resource not found";
        } else if (status === 409) {
          errorMessage = data?.message || "❌ Conflict: This resource already exists";
        } else if (status === 500) {
          errorMessage = "❌ Server error: Please try again later";
        } else {
          errorMessage = data?.message || data?.error || `❌ Error: ${status}`;
        }
      } else if (error.request) {
        errorMessage = "❌ Network error: Cannot reach the server";
      } else {
        errorMessage = error.message || "❌ Error: Something went wrong";
      }

      if (showNotification) {
        showNotification(errorMessage, "error");
      }

      return Promise.reject(error);
    }
  );

  return client;
};

export const useApiClient = () => {
  const { error: showError } = useNotification();
  return createApiClient(showError);
};
