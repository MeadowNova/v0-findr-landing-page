'use client';

import { useAuth as useAuthContext } from './AuthContext';
import { User, Session } from '@supabase/supabase-js';

// Re-export the useAuth hook from AuthContext
export const useAuth = useAuthContext;

/**
 * Check if a user is authenticated on the client side
 * @returns boolean indicating if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  try {
    const auth = useAuthContext();
    return auth.isAuthenticated;
  } catch (error) {
    return false;
  }
};

/**
 * Get the current user on the client side
 * @returns User object or null if not authenticated
 */
export const getCurrentUser = (): User | null => {
  try {
    const auth = useAuthContext();
    return auth.user;
  } catch (error) {
    return null;
  }
};

/**
 * Get the current session on the client side
 * @returns Session object or null if not authenticated
 */
export const getCurrentSession = (): Session | null => {
  try {
    const auth = useAuthContext();
    return auth.session;
  } catch (error) {
    return null;
  }
};

/**
 * Check if the current user has a specific role
 * @param role The role to check for
 * @returns boolean indicating if the user has the role
 */
export const hasRole = (role: string): boolean => {
  try {
    const auth = useAuthContext();
    if (!auth.user) return false;

    const userRoles = auth.user.app_metadata?.roles || [];
    return userRoles.includes(role);
  } catch (error) {
    return false;
  }
};

/**
 * Refresh the current session
 * @returns Promise<boolean> indicating if the refresh was successful
 */
export const refreshCurrentSession = async (): Promise<boolean> => {
  try {
    const auth = useAuthContext();
    return await auth.refreshSession();
  } catch (error) {
    return false;
  }
};

/**
 * Get user metadata
 * @returns User metadata object or empty object if not available
 */
export const getUserMetadata = (): Record<string, any> => {
  try {
    const auth = useAuthContext();
    return auth.user?.user_metadata || {};
  } catch (error) {
    return {};
  }
};