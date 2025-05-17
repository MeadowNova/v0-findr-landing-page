import { NextRequest } from 'next/server';
import {
  ApiContext,
  ApiException,
  ErrorCode,
  successResponse,
  withMiddleware,
} from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import { searchService } from '@/lib/services/search';
import { searchProcessorService } from '@/lib/services/search-processor';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/v1/searches/saved/[savedSearchId]/run
 *
 * Re-run a saved search
 */
export const POST = withMiddleware(
  async (req: NextRequest, context: ApiContext, { params }: { params: { savedSearchId: string } }) => {
    // Get saved search ID from dynamic route params
    const { savedSearchId } = params;

    if (!savedSearchId) {
      throw new ApiException(
        ErrorCode.VALIDATION_ERROR,
        'Saved search ID is required',
      );
    }

    // Get saved search with original search parameters
    const { data: savedSearch, error: savedSearchError } = await supabase
      .from('saved_searches')
      .select('*, searches(*)')
      .eq('id', savedSearchId)
      .eq('user_id', context.user!.id)
      .single();

    if (savedSearchError || !savedSearch) {
      throw new ApiException(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Saved search not found',
      );
    }

    // Create a new search with the same parameters
    const originalSearch = savedSearch.searches;
    const jobId = uuidv4();

    // Insert new search job
    const { error: jobError } = await supabase
      .from('search_jobs')
      .insert({
        id: jobId,
        search_id: originalSearch.id,
        status: 'pending'
      });

    if (jobError) {
      console.error('Error creating search job:', jobError);
      throw new ApiException(
        ErrorCode.INTERNAL_ERROR,
        'Failed to create search job',
      );
    }

    // Update saved search last run time
    const { error: updateError } = await supabase
      .from('saved_searches')
      .update({
        last_run_at: new Date().toISOString(),
        next_run_at: savedSearch.frequency === 'daily'
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', savedSearchId);

    if (updateError) {
      console.error('Error updating saved search:', updateError);
    }

    // Process search job asynchronously
    setTimeout(() => {
      searchProcessorService.processJob(jobId).catch(error => {
        console.error('Error processing search job:', error);
      });
    }, 0);

    // Return job ID
    return successResponse({
      jobId,
      searchId: originalSearch.id,
      message: 'Search job created successfully',
    });
  },
  { requireAuth: true }
);
