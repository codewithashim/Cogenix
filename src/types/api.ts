/**
 * API Types
 * 
 * Type definitions for API requests and responses
 */

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Error Response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode?: number;
  details?: any;
}

/**
 * Request Status
 */
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * API Request Config
 */
export interface ApiRequestConfig {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
}

