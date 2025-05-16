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

// Reset password request schema
const resetPasswordSchema = z.object({
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

// Reset password request type
type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;

/**
 * POST /api/v1/auth/reset-password
 * 
 * Reset a user's password
 */
export const POST = withMiddleware(async (req: NextRequest) => {
  // Validate request body
  const validationResult = await withBodyValidation(resetPasswordSchema)(req);
  if (validationResult) return validationResult;
  
  // Get validated data
  const { password } = (req as any).validatedBody as ResetPasswordRequest;
  
  // Update password
  const { error } = await authService.updatePassword({ password });
  
  if (error) {
    throw new ApiException(
      ErrorCode.INTERNAL_ERROR,
      'Failed to reset password',
      { message: error.message }
    );
  }
  
  return successResponse({
    message: 'Password reset successful',
  });
});
