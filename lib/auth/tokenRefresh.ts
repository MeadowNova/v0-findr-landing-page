'use client';

import { supabase } from '../supabase/client';
import { Session } from '@supabase/supabase-js';

/**
 * Token refresh utility functions
 */
export const tokenRefresh = {
  /**
   * Check if a session is expired or about to expire
   * @param session The current session
   * @param expiryBufferSeconds Time in seconds before actual expiry to consider a token as expired (default: 60)
   * @returns Boolean indicating if the session is expired or about to expire
   */
  isSessionExpired: (session: Session | null, expiryBufferSeconds = 60): boolean => {
    if (!session) return true;
    
    // Get the expiry time from the session
    const expiresAt = session.expires_at;
    if (!expiresAt) return false;
    
    // Calculate the current time plus buffer in seconds
    const currentTime = Math.floor(Date.now() / 1000);
    const bufferTime = currentTime + expiryBufferSeconds;
    
    // Return true if the session is expired or about to expire within the buffer time
    return expiresAt < bufferTime;
  },
  
  /**
   * Refresh the session token
   * @returns A promise that resolves to the refreshed session or null if refresh failed
   */
  refreshSession: async (): Promise<Session | null> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return null;
      }
      
      return data.session;
    } catch (error) {
      console.error('Exception during session refresh:', error);
      return null;
    }
  },
  
  /**
   * Get the current session and refresh it if needed
   * @param expiryBufferSeconds Time in seconds before actual expiry to consider a token as expired (default: 60)
   * @returns A promise that resolves to the current or refreshed session, or null if no session exists or refresh failed
   */
  getAndRefreshSessionIfNeeded: async (expiryBufferSeconds = 60): Promise<Session | null> => {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session exists, return null
      if (!session) return null;
      
      // If the session is not expired, return it
      if (!tokenRefresh.isSessionExpired(session, expiryBufferSeconds)) {
        return session;
      }
      
      // If the session is expired, refresh it
      return await tokenRefresh.refreshSession();
    } catch (error) {
      console.error('Error getting or refreshing session:', error);
      return null;
    }
  },
  
  /**
   * Set up a periodic token refresh
   * @param refreshIntervalMinutes How often to check and refresh the token in minutes (default: 10)
   * @returns A function to clear the interval when no longer needed
   */
  setupPeriodicRefresh: (refreshIntervalMinutes = 10): (() => void) => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return () => {}; // Return empty function for SSR
    }
    
    // Set up interval to refresh token
    const intervalId = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If session exists and is about to expire, refresh it
      if (session && tokenRefresh.isSessionExpired(session, 5 * 60)) { // 5 minutes buffer
        await tokenRefresh.refreshSession();
      }
    }, refreshIntervalMinutes * 60 * 1000);
    
    // Return function to clear interval
    return () => clearInterval(intervalId);
  }
};