import { NextRequest } from 'next/server';
import { 
  ApiException, 
  ErrorCode, 
  successResponse, 
  withBodyValidation, 
  withMiddleware,
  z
} from '@/lib/api';

// Login request schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Login request type
type LoginRequest = z.infer<typeof loginSchema>;

/**
 * POST /api/v1/auth/login
 * 
 * Authenticate a user and return a JWT token
 */
export const POST = withMiddleware(async (req: NextRequest) => {
  // Validate request body
  const validationResult = await withBodyValidation(loginSchema)(req);
  if (validationResult) return validationResult;
  
  // Get validated data
  const { email, password } = (req as any).validatedBody as LoginRequest;
  
  // TODO: Implement actual authentication logic
  // This is a placeholder implementation
  
  // Mock authentication logic
  if (email === 'user@example.com' && password === 'password123') {
    // Mock successful login
    return successResponse({
      user: {
        id: '123',
        email: 'user@example.com',
        createdAt: new Date().toISOString(),
      },
      token: 'mock-jwt-token',
    });
  }
  
  // Mock failed login
  throw new ApiException(
    ErrorCode.INVALID_CREDENTIALS,
    'Invalid email or password'
  );
});