/**
 * Axios Configuration
 * 
 * Global axios instance with interceptors for error handling,
 * request/response transformation, and authentication.
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { publicEnv } from '@/config/env';

/**
 * Create axios instance with default config
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: publicEnv.appUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Add authentication tokens, modify requests before sending
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authentication token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle responses and errors globally
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Transform response data if needed
    return response;
  },
  (error: AxiosError) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            // You can dispatch a custom event or use your router here
            console.error('Unauthorized access - please login again');
          }
          break;
        case 403:
          console.error('Forbidden - insufficient permissions');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Internal server error');
          break;
        default:
          console.error('API Error:', data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response from server - please check your connection');
    } else {
      // Error in request configuration
      console.error('Request configuration error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Generic API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Helper function to handle API errors
 */
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    return new ApiError(
      axiosError.message,
      axiosError.response?.status,
      axiosError.response?.data
    );
  }
  
  if (error instanceof Error) {
    return new ApiError(error.message);
  }
  
  return new ApiError('An unknown error occurred');
};

/**
 * Generic request wrapper with error handling
 */
export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await axiosInstance.request<T>(config);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export default axiosInstance;

