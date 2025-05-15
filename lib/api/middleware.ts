import { NextRequest, NextResponse } from 'next/server';
import { ApiContext, ApiException, ErrorCode } from './types';
import { errorResponse, unauthorizedResponse } from './response';

/**
 * Type for middleware handler functions
 */
export type MiddlewareHandler = (
  req: NextRequest,
  context: ApiContext
) => Promise<NextResponse | void> | NextResponse | void;

/**
 * Middleware for handling API requests
 * @param handler The handler function to execute
 * @param options Middleware options
 * @returns NextResponse
 */
export function withMiddleware(
  handler: MiddlewareHandler,
  options: {
    requireAuth?: boolean;
    rateLimit?: {
      limit: number;
      window: number; // in seconds
    };
  } = {}
) {
  return async function(req: NextRequest): Promise<NextResponse> {
    // Initialize context
    const context: ApiContext = {
      isAuthenticated: false,
    };
    
    try {
      // Apply authentication middleware if required
      if (options.requireAuth) {
        const authResult = await authenticateRequest(req);
        if (!authResult.isAuthenticated) {
          return unauthorizedResponse(authResult.message);
        }
        context.user = authResult.user;
        context.isAuthenticated = true;
      } else {
        // Try to authenticate but don't require it
        const authResult = await authenticateRequest(req, false);
        if (authResult.isAuthenticated) {
          context.user = authResult.user;
          context.isAuthenticated = true;
        }
      }
      
      // Apply rate limiting middleware if configured
      if (options.rateLimit) {
        const rateLimitResult = await checkRateLimit(req, options.rateLimit);
        if (!rateLimitResult.allowed) {
          throw new ApiException(
            ErrorCode.RATE_LIMIT_EXCEEDED,
            'Rate limit exceeded',
            { retryAfter: rateLimitResult.retryAfter }
          );
        }
      }
      
      // Execute the handler
      const response = await handler(req, context);
      
      // Return the response or a default success response
      return response || NextResponse.json({ success: true });
    } catch (error) {
      // Handle errors
      return errorResponse(error instanceof Error ? error : new Error(String(error)));
    }
  };
}

/**
 * Authenticate a request
 * @param req The request object
 * @param required Whether authentication is required
 * @returns Authentication result
 */
async function authenticateRequest(req: NextRequest, required: boolean = true): Promise<{
  isAuthenticated: boolean;
  user?: any;
  message?: string;
}> {
  // Get the authorization header
  const authHeader = req.headers.get('authorization');
  
  // If no auth header and auth is required, return unauthorized
  if (!authHeader && required) {
    return {
      isAuthenticated: false,
      message: 'Authentication required',
    };
  }
  
  // If no auth header and auth is not required, return not authenticated
  if (!authHeader && !required) {
    return {
      isAuthenticated: false,
    };
  }
  
  // Check if the auth header is a bearer token
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      isAuthenticated: false,
      message: 'Invalid authentication format',
    };
  }
  
  // Extract the token
  const token = authHeader.substring(7);
  
  try {
    // TODO: Implement JWT verification with a proper library
    // For now, we'll use a placeholder implementation
    
    // This is a placeholder for JWT verification
    // In a real implementation, you would verify the token and extract the user data
    if (token === 'invalid-token') {
      return {
        isAuthenticated: false,
        message: 'Invalid token',
      };
    }
    
    // Mock user data for demonstration
    const user = {
      id: '123',
      email: 'user@example.com',
    };
    
    return {
      isAuthenticated: true,
      user,
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      message: 'Invalid token',
    };
  }
}

/**
 * Check rate limit for a request
 * @param req The request object
 * @param options Rate limit options
 * @returns Rate limit check result
 */
async function checkRateLimit(
  req: NextRequest,
  options: { limit: number; window: number }
): Promise<{ allowed: boolean; retryAfter?: number }> {
  // TODO: Implement rate limiting with Redis or similar
  // For now, we'll use a placeholder implementation that always allows requests
  
  // This is a placeholder for rate limiting
  // In a real implementation, you would check the rate limit against a store like Redis
  return {
    allowed: true,
  };
}