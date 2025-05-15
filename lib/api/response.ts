import { NextResponse } from 'next/server';
import { ApiError, ApiException, ApiResponse, ErrorCode, errorCodeToStatusCode } from './types';

/**
 * Creates a success response
 * @param data Response data
 * @param meta Response metadata
 * @returns NextResponse with success response
 */
export function successResponse<T>(data: T, meta?: any): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  };
  
  return NextResponse.json(response);
}

/**
 * Creates an error response
 * @param error Error object or ApiException
 * @returns NextResponse with error response
 */
export function errorResponse(error: Error | ApiException): NextResponse {
  let apiError: ApiError;
  let statusCode: number = 500;
  
  if (error instanceof ApiException) {
    apiError = {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    };
    statusCode = errorCodeToStatusCode[error.code];
  } else {
    // For unexpected errors, use a generic internal error
    console.error('Unexpected error:', error);
    apiError = {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
    };
  }
  
  const response: ApiResponse = {
    success: false,
    error: apiError,
  };
  
  return NextResponse.json(response, { status: statusCode });
}

/**
 * Creates a validation error response
 * @param errors Validation errors
 * @returns NextResponse with validation error response
 */
export function validationErrorResponse(errors: Record<string, string[]>): NextResponse {
  const apiError: ApiError = {
    code: ErrorCode.VALIDATION_ERROR,
    message: 'Validation failed',
    details: { errors },
  };
  
  const response: ApiResponse = {
    success: false,
    error: apiError,
  };
  
  return NextResponse.json(response, { status: 422 });
}

/**
 * Creates a not found error response
 * @param message Error message
 * @returns NextResponse with not found error response
 */
export function notFoundResponse(message: string = 'Resource not found'): NextResponse {
  return errorResponse(new ApiException(ErrorCode.RESOURCE_NOT_FOUND, message));
}

/**
 * Creates an unauthorized error response
 * @param message Error message
 * @returns NextResponse with unauthorized error response
 */
export function unauthorizedResponse(message: string = 'Authentication required'): NextResponse {
  return errorResponse(new ApiException(ErrorCode.AUTH_REQUIRED, message));
}

/**
 * Creates a forbidden error response
 * @param message Error message
 * @returns NextResponse with forbidden error response
 */
export function forbiddenResponse(message: string = 'Permission denied'): NextResponse {
  return errorResponse(new ApiException(ErrorCode.PERMISSION_DENIED, message));
}