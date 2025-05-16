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

// Forgot password request schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Forgot password request type
type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;

/**
 * POST /api/v1/auth/forgot-password
 * 
 * Send a password reset email
 */
export const POST = withMiddleware(async (req: NextRequest) => {
  // Validate request body
  const validationResult = await withBodyValidation(forgotPasswordSchema)(req);
  if (validationResult) return validationResult;
  
  // Get validated data
  const { email } = (req as any).validatedBody as ForgotPasswordRequest;
  
  // Send password reset email
  const { error } = await authService.resetPassword({ email });
  
  if (error) {
    // We don't want to reveal if an email exists in our system
    // So we'll just log the error and return success anyway
    console.error('Password reset error:', error);
  }
  
  // Always return success, even if the email doesn't exist
  // This is a security best practice to prevent email enumeration
  return successResponse({
    message: 'Password reset email sent',
  });
});
