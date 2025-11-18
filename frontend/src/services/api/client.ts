import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens or headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      if (status === 401) {
        // Handle unauthorized
      } else if (status === 403) {
        // Handle forbidden
      } else if (status >= 500) {
        // Handle server errors
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

