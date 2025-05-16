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

  // Authenticate with Supabase
  const { data, error } = await authService.login({ email, password });

  if (error) {
    throw new ApiException(
      ErrorCode.INVALID_CREDENTIALS,
      'Invalid email or password'
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
  });
});