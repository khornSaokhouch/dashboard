import axios from 'axios';
// Import your config file if you still have it, or define the URL directly
import config from './config';
// Import the Zustand auth store directly
import { useAuthStore } from '../stores/authStore';

// Create a new Axios instance. This is a key part of the pattern.
const api = axios.create({
  baseURL: config.base_url, // Your base URL from config.js
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
  },
});

// ============================================================================
// THE AXIOS INTERCEPTOR
// This function will run automatically BEFORE every single request sent by 'api'.
// ============================================================================
// The Axios Interceptor is working perfectly and needs no changes.
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


/**
 * A new, simplified wrapper for making API requests using our configured instance.
 * @param {string} url - The API endpoint to call (e.g., '/service-page').
 * @param {string} method - The HTTP method (e.g., 'GET', 'POST').
 * @param {object|FormData} [data] - The request body for POST/PUT requests.
 * @param {object} [customConfig] - Additional Axios options if needed.
 * @returns {Promise<object>} - The data from the API response.
 */
export const request = async (url, method = 'POST', data = {}, customConfig = {}) => {
  try {
    // Use our pre-configured 'api' instance. The interceptor will handle the token.
    const response = await api({
      url,
      method,
      data,
      ...customConfig,
    });
    return response.data; // Just return the data
  } catch (error) {
      if (error.response?.status !== 404) {
      console.error("API response error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    throw error;
  }
};