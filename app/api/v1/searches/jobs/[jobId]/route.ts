import { NextRequest } from 'next/server';
import { 
  ApiContext, 
  ApiException, 
  ErrorCode, 
  successResponse, 
  withMiddleware,
} from '@/lib/api';
import { searchService } from '@/lib/services/search';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/v1/searches/jobs/[jobId]
 * 
 * Get search job status
 */
export const GET = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Get job ID from URL
    const url = new URL(req.url);
    const jobId = url.pathname.split('/').pop();
    
    if (!jobId) {
      throw new ApiException(
        ErrorCode.VALIDATION_ERROR,
        'Job ID is required',
      );
    }
    
    // Verify that the job belongs to the user
    const { data: job, error: jobError } = await supabase
      .from('search_jobs')
      .select('*, searches!inner(*)')
      .eq('id', jobId)
      .eq('searches.user_id', context.user!.id)
      .single();
    
    if (jobError || !job) {
      throw new ApiException(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Job not found',
      );
    }
    
    // Get result count
    const { count, error: countError } = await supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('job_id', jobId);
    
    if (countError) {
      console.error('Error getting result count:', countError);
    }
    
    // Return job status
    return successResponse({
      job: {
        id: job.id,
        searchId: job.search_id,
        status: job.status,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        error: job.error,
        createdAt: job.created_at,
        resultCount: count || 0,
      },
    });
  },
  { requireAuth: true }
);
