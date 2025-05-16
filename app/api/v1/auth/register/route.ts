import { NextRequest } from 'next/server';
import {
  ApiException,
  ErrorCode,
  successResponse,
  withBodyValidation,
  withMiddleware,
  z
} from '@/lib/api';
import { authService } from '@/lib/supabase/auth';

// Register request schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Register request type
type RegisterRequest = z.infer<typeof registerSchema>;

/**
 * POST /api/v1/auth/register
 *
 * Register a new user
 */
export const POST = withMiddleware(async (req: NextRequest) => {
  // Validate request body
  const validationResult = await withBodyValidation(registerSchema)(req);
  if (validationResult) return validationResult;

  // Get validated data
  const { email, password } = (req as any).validatedBody as RegisterRequest;

  // Register with Supabase
  const { data, error } = await authService.register({ email, password });

  if (error) {
    // Check if the error is due to email already in use
    if (error.message?.includes('email already in use') || error.message?.includes('already registered')) {
      throw new ApiException(
        ErrorCode.VALIDATION_ERROR,
        'Email already in use',
        { email: ['Email already in use'] }
      );
    }

    // Handle other registration errors
    throw new ApiException(
      ErrorCode.INTERNAL_ERROR,
      'Failed to register user',
      { message: error.message }
    );
  }

  // Return user data and session
  return successResponse({
    user: {
      id: data.user?.id,
      email: data.user?.email,
      createdAt: data.user?.created_at,
    },
    session: {
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      expiresAt: data.session?.expires_at,
    }
  }, null, 201);
});