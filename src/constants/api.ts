/**
 * API Constants
 * 
 * Centralized API endpoint definitions.
 * All API routes should be defined here for easy maintenance.
 */

/**
 * Base API path
 */
export const API_BASE = '/api';

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Chat Endpoints
  CHAT: {
    BASE: `${API_BASE}/chat`,
    SEND_MESSAGE: `${API_BASE}/chat`,
  },

  // Thread Endpoints
  THREADS: {
    BASE: `${API_BASE}/threads`,
    BY_ID: (id: string) => `${API_BASE}/threads/${id}`,
    MESSAGES: (id: string) => `${API_BASE}/threads/${id}/messages`,
  },

  // Memory Endpoints
  MEMORY: {
    BASE: `${API_BASE}/memory`,
    CLEAR: `${API_BASE}/memory/clear`,
  },

  // Model Endpoints
  MODELS: {
    BASE: `${API_BASE}/models`,
    LIST: `${API_BASE}/models`,
  },
} as const;

/**
 * API Methods
 */
export const API_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

/**
 * API Response Status
 */
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Request Timeouts (in milliseconds)
 */
export const API_TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  LONG: 60000,    // 60 seconds
  SHORT: 10000,   // 10 seconds
} as const;

/**
 * Retry Configuration
 */
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  EXPONENTIAL_BACKOFF: true,
} as const;

