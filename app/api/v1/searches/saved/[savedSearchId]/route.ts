import { NextRequest } from 'next/server';
import { 
  ApiContext, 
  ApiException, 
  ErrorCode, 
  successResponse, 
  withMiddleware,
} from '@/lib/api';
import { supabase } from '@/lib/supabase/client';

/**
 * DELETE /api/v1/searches/saved/[savedSearchId]
 * 
 * Delete a saved search
 */
export const DELETE = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Get saved search ID from URL
    const url = new URL(req.url);
    const savedSearchId = url.pathname.split('/').pop();
    
    if (!savedSearchId) {
      throw new ApiException(
        ErrorCode.VALIDATION_ERROR,
        'Saved search ID is required',
      );
    }
    
    // Verify that the saved search belongs to the user
    const { data: savedSearch, error: savedSearchError } = await supabase
      .from('saved_searches')
      .select('id')
      .eq('id', savedSearchId)
      .eq('user_id', context.user!.id)
      .single();
    
    if (savedSearchError || !savedSearch) {
      throw new ApiException(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Saved search not found',
      );
    }
    
    // Delete saved search
    const { error: deleteError } = await supabase
      .from('saved_searches')
      .delete()
      .eq('id', savedSearchId);
    
    if (deleteError) {
      console.error('Error deleting saved search:', deleteError);
      throw new ApiException(
        ErrorCode.INTERNAL_ERROR,
        'Failed to delete saved search',
      );
    }
    
    // Return success
    return successResponse({
      message: 'Saved search deleted successfully',
    });
  },
  { requireAuth: true }
);
