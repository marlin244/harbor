/**
 * HTTP Client Configuration
 * Centralized axios instance with interceptors for API requests
 */

import axios from 'axios';

export const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('HTTP error:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server:', error.request);
    } else {
      // Error in request setup
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * API Response Contract
 * Standard format for all API responses
 */
export interface ApiResponse<T> {
  items?: T[];
  data?: T;
  page?: number;
  total?: number;
  success?: boolean;
  message?: string;
  error?: string;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}
