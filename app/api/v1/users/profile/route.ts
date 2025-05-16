import { NextRequest } from 'next/server';
import { 
  ApiContext, 
  ApiException, 
  ErrorCode, 
  successResponse, 
  withBodyValidation, 
  withMiddleware,
  z
} from '@/lib/api';
import { authService } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';

// Update profile request schema
const updateProfileSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  phoneNumber: z.string().optional(),
  notificationEmail: z.boolean().optional(),
  notificationSms: z.boolean().optional(),
});

// Update profile request type
type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;

/**
 * GET /api/v1/users/profile
 * 
 * Get the current user's profile
 */
export const GET = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // This endpoint requires authentication
    const userId = context.user?.id;
    
    // Get user preferences from the database
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (preferencesError && preferencesError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine for new users
      console.error('Error fetching user preferences:', preferencesError);
    }
    
    return successResponse({
      user: {
        id: context.user?.id,
        email: context.user?.email,
        createdAt: context.user?.created_at,
        preferences: preferences || {
          notificationEmail: true,
          notificationSms: false,
          phoneNumber: null,
        },
      },
    });
  },
  { requireAuth: true }
);

/**
 * PATCH /api/v1/users/profile
 * 
 * Update the current user's profile
 */
export const PATCH = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Validate request body
    const validationResult = await withBodyValidation(updateProfileSchema)(req);
    if (validationResult) return validationResult;
    
    // Get validated data
    const { email, phoneNumber, notificationEmail, notificationSms } = 
      (req as any).validatedBody as UpdateProfileRequest;
    
    const userId = context.user?.id;
    
    // Update user profile if email is provided
    if (email) {
      const { error } = await authService.updateProfile({ email });
      
      if (error) {
        throw new ApiException(
          ErrorCode.INTERNAL_ERROR,
          'Failed to update profile',
          { message: error.message }
        );
      }
    }
    
    // Update user preferences
    const preferencesData: any = {};
    if (phoneNumber !== undefined) preferencesData.phone_number = phoneNumber;
    if (notificationEmail !== undefined) preferencesData.notification_email = notificationEmail;
    if (notificationSms !== undefined) preferencesData.notification_sms = notificationSms;
    
    if (Object.keys(preferencesData).length > 0) {
      // Check if preferences exist
      const { data: existingPreferences } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      let preferencesError;
      
      if (existingPreferences) {
        // Update existing preferences
        const { error } = await supabase
          .from('user_preferences')
          .update(preferencesData)
          .eq('user_id', userId);
        
        preferencesError = error;
      } else {
        // Insert new preferences
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            ...preferencesData,
          });
        
        preferencesError = error;
      }
      
      if (preferencesError) {
        throw new ApiException(
          ErrorCode.INTERNAL_ERROR,
          'Failed to update preferences',
          { message: preferencesError.message }
        );
      }
    }
    
    // Get updated user data
    const { user, error: userError } = await authService.getUser();
    
    if (userError) {
      throw new ApiException(
        ErrorCode.INTERNAL_ERROR,
        'Failed to retrieve updated user data',
        { message: userError.message }
      );
    }
    
    // Get updated preferences
    const { data: updatedPreferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (preferencesError && preferencesError.code !== 'PGRST116') {
      console.error('Error fetching updated user preferences:', preferencesError);
    }
    
    return successResponse({
      user: {
        id: user?.id,
        email: user?.email,
        createdAt: user?.created_at,
        preferences: updatedPreferences || {
          notificationEmail: notificationEmail ?? true,
          notificationSms: notificationSms ?? false,
          phoneNumber: phoneNumber ?? null,
        },
      },
    });
  },
  { requireAuth: true }
);
