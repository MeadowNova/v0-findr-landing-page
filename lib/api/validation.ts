import { NextRequest } from 'next/server';
import { z } from 'zod';
import { validationErrorResponse } from './response';

/**
 * Validates request body against a Zod schema
 * @param req The request object
 * @param schema The Zod schema to validate against
 * @returns Validation result
 */
export async function validateBody<T>(
  req: NextRequest,
  schema: z.ZodType<T>
): Promise<{ success: boolean; data?: T; errors?: Record<string, string[]> }> {
  try {
    // Parse the request body
    const body = await req.json();
    
    // Validate the body against the schema
    const result = schema.safeParse(body);
    
    if (!result.success) {
      // Format the validation errors
      const errors = formatZodErrors(result.error);
      return { success: false, errors };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    // Handle JSON parsing errors
    return {
      success: false,
      errors: { _error: ['Invalid JSON in request body'] },
    };
  }
}

/**
 * Validates query parameters against a Zod schema
 * @param req The request object
 * @param schema The Zod schema to validate against
 * @returns Validation result
 */
export function validateQuery<T>(
  req: NextRequest,
  schema: z.ZodType<T>
): { success: boolean; data?: T; errors?: Record<string, string[]> } {
  try {
    // Get the URL search params
    const url = new URL(req.url);
    const queryParams: Record<string, any> = {};
    
    // Convert URLSearchParams to a plain object
    url.searchParams.forEach((value, key) => {
      // Handle array parameters (e.g., filter[status]=pending&filter[status]=completed)
      if (key.includes('[') && key.includes(']')) {
        const mainKey = key.substring(0, key.indexOf('['));
        const subKey = key.substring(key.indexOf('[') + 1, key.indexOf(']'));
        
        if (!queryParams[mainKey]) {
          queryParams[mainKey] = {};
        }
        
        if (queryParams[mainKey][subKey]) {
          if (Array.isArray(queryParams[mainKey][subKey])) {
            queryParams[mainKey][subKey].push(value);
          } else {
            queryParams[mainKey][subKey] = [queryParams[mainKey][subKey], value];
          }
        } else {
          queryParams[mainKey][subKey] = value;
        }
      } else {
        // Handle regular parameters
        if (queryParams[key]) {
          if (Array.isArray(queryParams[key])) {
            queryParams[key].push(value);
          } else {
            queryParams[key] = [queryParams[key], value];
          }
        } else {
          queryParams[key] = value;
        }
      }
    });
    
    // Parse numeric values
    Object.keys(queryParams).forEach(key => {
      if (key === 'page' || key === 'limit') {
        queryParams[key] = parseInt(queryParams[key], 10);
      }
    });
    
    // Validate the query params against the schema
    const result = schema.safeParse(queryParams);
    
    if (!result.success) {
      // Format the validation errors
      const errors = formatZodErrors(result.error);
      return { success: false, errors };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    // Handle unexpected errors
    return {
      success: false,
      errors: { _error: ['Invalid query parameters'] },
    };
  }
}

/**
 * Middleware for validating request body
 * @param schema The Zod schema to validate against
 * @returns Middleware handler
 */
export function withBodyValidation<T>(schema: z.ZodType<T>) {
  return async (req: NextRequest) => {
    const validation = await validateBody(req, schema);
    
    if (!validation.success) {
      return validationErrorResponse(validation.errors!);
    }
    
    // Attach the validated data to the request for later use
    (req as any).validatedBody = validation.data;
    
    return undefined; // Continue to the next middleware
  };
}

/**
 * Middleware for validating query parameters
 * @param schema The Zod schema to validate against
 * @returns Middleware handler
 */
export function withQueryValidation<T>(schema: z.ZodType<T>) {
  return (req: NextRequest) => {
    const validation = validateQuery(req, schema);
    
    if (!validation.success) {
      return validationErrorResponse(validation.errors!);
    }
    
    // Attach the validated data to the request for later use
    (req as any).validatedQuery = validation.data;
    
    return undefined; // Continue to the next middleware
  };
}

/**
 * Format Zod validation errors into a more usable format
 * @param error Zod validation error
 * @returns Formatted errors
 */
function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    const key = path || '_error';
    
    if (!errors[key]) {
      errors[key] = [];
    }
    
    errors[key].push(err.message);
  });
  
  return errors;
}