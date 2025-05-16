import { supabase } from '@/lib/supabase/client';
import { brightDataService } from './brightdata';
import { matchingService } from './matching';
import { v4 as uuidv4 } from 'uuid';
import { SearchJobStatus, SearchParams } from '@/lib/types/search';

/**
 * Search job processor service
 */
export const searchProcessorService = {
  /**
   * Process a search job
   * @param jobId Job ID
   * @returns Processing result
   */
  async processJob(jobId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Update job status to processing
      await this.updateJobStatus(jobId, 'processing');

      // Get job and search details
      const { data: job, error: jobError } = await supabase
        .from('search_jobs')
        .select('*, searches(*)')
        .eq('id', jobId)
        .single();

      if (jobError || !job) {
        throw new Error(`Failed to get job details: ${jobError?.message || 'Job not found'}`);
      }

      const search = job.searches;
      const searchParams = search.parameters;

      // Search Facebook Marketplace using Bright Data MCP
      // Use mock search in development environment
      const results = process.env.NODE_ENV === 'production'
        ? await brightDataService.searchFacebookMarketplace(searchParams)
        : await brightDataService.mockSearch(searchParams);

      // Process and store results
      await this.storeSearchResults(jobId, search.id, results, searchParams);

      // Update job status to completed
      await this.updateJobStatus(jobId, 'completed');

      return { success: true };
    } catch (error) {
      console.error('Error processing search job:', error);

      // Update job status to failed
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.updateJobStatus(jobId, 'failed', errorMessage);

      return { success: false, error: errorMessage };
    }
  },

  /**
   * Update job status
   * @param jobId Job ID
   * @param status New status
   * @param error Error message (for failed jobs)
   */
  async updateJobStatus(
    jobId: string,
    status: SearchJobStatus,
    error?: string
  ): Promise<void> {
    const updates: any = { status };

    // Add timestamps based on status
    if (status === 'processing') {
      updates.started_at = new Date().toISOString();
    } else if (status === 'completed' || status === 'failed') {
      updates.completed_at = new Date().toISOString();
    }

    // Add error message for failed jobs
    if (status === 'failed' && error) {
      updates.error = error;
    }

    // Update job in database
    const { error: updateError } = await supabase
      .from('search_jobs')
      .update(updates)
      .eq('id', jobId);

    if (updateError) {
      console.error('Error updating job status:', updateError);
    }
  },

  /**
   * Store search results in database
   * @param jobId Job ID
   * @param searchId Search ID
   * @param results Search results
   * @param searchParams Original search parameters
   */
  async storeSearchResults(
    jobId: string,
    searchId: string,
    results: any[],
    searchParams: SearchParams
  ): Promise<void> {
    // Process results in batches to avoid database limits
    const batchSize = 50;
    const batches = [];

    for (let i = 0; i < results.length; i += batchSize) {
      batches.push(results.slice(i, i + batchSize));
    }

    // Process each batch
    for (const batch of batches) {
      const matchesToInsert = batch.map(result => {
        // Calculate relevance score
        const relevanceScore = matchingService.calculateRelevanceScore(result, searchParams);

        return {
          id: uuidv4(),
          job_id: jobId,
          search_id: searchId,
          listing_id: result.listingId,
          title: result.title,
          price: result.price,
          currency: result.currency || 'USD',
          location: result.location,
          distance: result.distance,
          listing_url: result.listingUrl,
          image_url: result.imageUrl,
          description: result.description,
          seller_info: result.sellerInfo,
          relevance_score: relevanceScore
        };
      });

      // Insert matches into database
      const { error } = await supabase
        .from('matches')
        .insert(matchesToInsert);

      if (error) {
        console.error('Error storing search results:', error);
        throw new Error(`Failed to store search results: ${error.message}`);
      }
    }
  },

  /**
   * Process pending search jobs
   * @param limit Maximum number of jobs to process
   * @returns Processing results
   */
  async processPendingJobs(limit: number = 10): Promise<{ processed: number; succeeded: number; failed: number }> {
    // Get pending jobs
    const { data: pendingJobs, error } = await supabase
      .from('search_jobs')
      .select('id')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error getting pending jobs:', error);
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    if (!pendingJobs || pendingJobs.length === 0) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    // Process each job
    let succeeded = 0;
    let failed = 0;

    for (const job of pendingJobs) {
      const { success } = await this.processJob(job.id);

      if (success) {
        succeeded++;
      } else {
        failed++;
      }
    }

    return {
      processed: pendingJobs.length,
      succeeded,
      failed
    };
  }
};
