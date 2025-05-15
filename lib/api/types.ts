/**
 * API response types for the Snagr AI API
 */

// Base response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMetadata;
}

// Error response interface
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Metadata interface (for pagination, etc.)
export interface ApiMetadata {
  pagination?: PaginationMeta;
  [key: string]: any;
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Request context with authentication info
export interface ApiContext {
  user?: {
    id: string;
    email: string;
    [key: string]: any;
  };
  isAuthenticated: boolean;
}

// Standard error codes
export enum ErrorCode {
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// HTTP status codes mapped to error codes
export const errorCodeToStatusCode: Record<ErrorCode, number> = {
  [ErrorCode.AUTH_REQUIRED]: 401,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.PERMISSION_DENIED]: 403,
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,
  [ErrorCode.VALIDATION_ERROR]: 422,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.PAYMENT_REQUIRED]: 402,
  [ErrorCode.PAYMENT_FAILED]: 400,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.INTERNAL_ERROR]: 500,
};

// API error class
export class ApiException extends Error {
  code: ErrorCode;
  details?: Record<string, any>;
  
  constructor(code: ErrorCode, message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ApiException';
    this.code = code;
    this.details = details;
  }
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Sorting parameters
export interface SortParams {
  sort?: string; // Field name, prefix with '-' for descending
}

// Filter parameters
export interface FilterParams {
  filter?: Record<string, any>;
}

// Combined query parameters
export type QueryParams = PaginationParams & SortParams & FilterParams;