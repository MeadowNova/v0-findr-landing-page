'use client';

import { tokenRefresh } from '../auth/tokenRefresh';
import { supabase } from '../supabase/client';

/**
 * API interceptor for handling token refresh
 */
export const apiInterceptor = {
  /**
   * Add authorization header to fetch requests
   * @param url The URL to fetch
   * @param options The fetch options
   * @returns A promise that resolves to the fetch response
   */
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    // Check if we need to refresh the token before making the request
    const session = await tokenRefresh.getAndRefreshSessionIfNeeded();
    
    // If we have a session, add the authorization header
    if (session) {
      // Create headers object if it doesn't exist
      const headers = options.headers || {};
      
      // Add authorization header
      const newHeaders = {
        ...headers,
        'Authorization': `Bearer ${session.access_token}`,
      };
      
      // Update options with new headers
      options.headers = newHeaders;
    }
    
    // Make the request
    let response = await fetch(url, options);
    
    // If the response is 401 Unauthorized, try to refresh the token and retry the request
    if (response.status === 401) {
      // Try to refresh the token
      const refreshedSession = await tokenRefresh.refreshSession();
      
      // If we successfully refreshed the token, retry the request
      if (refreshedSession) {
        // Update the authorization header with the new token
        const headers = options.headers || {};
        const newHeaders = {
          ...headers,
          'Authorization': `Bearer ${refreshedSession.access_token}`,
        };
        
        // Update options with new headers
        options.headers = newHeaders;
        
        // Retry the request
        response = await fetch(url, options);
      }
    }
    
    return response;
  },
  
  /**
   * Get the current auth token
   * @returns A promise that resolves to the current auth token or null if not authenticated
   */
  async getAuthToken(): Promise<string | null> {
    try {
      // Check if we need to refresh the token
      const session = await tokenRefresh.getAndRefreshSessionIfNeeded();
      
      // Return the access token if we have a session
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },
  
  /**
   * Check if the current user is authenticated
   * @returns A promise that resolves to a boolean indicating if the user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // Check if we need to refresh the token
      const session = await tokenRefresh.getAndRefreshSessionIfNeeded();
      
      // Return true if we have a session
      return !!session;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },
};