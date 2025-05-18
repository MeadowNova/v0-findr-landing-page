import { supabase } from './client';
import { supabaseServer } from './server';
import { ApiException, ErrorCode } from '@/lib/api';

/**
 * Authentication service for Supabase
 */
export const authService = {
  /**
   * Register a new user
   * @param email User email
   * @param password User password
   * @returns User data
   */
  async register(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw new ApiException(
          ErrorCode.AUTHENTICATION_ERROR,
          error.message,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      
      throw new ApiException(
        ErrorCode.AUTHENTICATION_ERROR,
        'Failed to register user',
      );
    }
  },

  /**
   * Login a user
   * @param email User email
   * @param password User password
   * @returns User data
   */
  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new ApiException(
          ErrorCode.AUTHENTICATION_ERROR,
          error.message,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      
      throw new ApiException(
        ErrorCode.AUTHENTICATION_ERROR,
        'Failed to login user',
      );
    }
  },

  /**
   * Logout the current user
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new ApiException(
          ErrorCode.AUTHENTICATION_ERROR,
          error.message,
        );
      }
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      
      throw new ApiException(
        ErrorCode.AUTHENTICATION_ERROR,
        'Failed to logout user',
      );
    }
  },

  /**
   * Get the current user
   * @returns User data
   */
  async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        throw new ApiException(
          ErrorCode.AUTHENTICATION_ERROR,
          error.message,
        );
      }

      return data.user;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      
      throw new ApiException(
        ErrorCode.AUTHENTICATION_ERROR,
        'Failed to get user',
      );
    }
  },

  /**
   * Get the current session
   * @returns Session data
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw new ApiException(
          ErrorCode.AUTHENTICATION_ERROR,
          error.message,
        );
      }

      return data.session;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      
      throw new ApiException(
        ErrorCode.AUTHENTICATION_ERROR,
        'Failed to get session',
      );
    }
  },

  /**
   * Send a password reset email
   * @param email User email
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw new ApiException(
          ErrorCode.AUTHENTICATION_ERROR,
          error.message,
        );
      }
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      
      throw new ApiException(
        ErrorCode.AUTHENTICATION_ERROR,
        'Failed to send password reset email',
      );
    }
  },

  /**
   * Update the user's password
   * @param password New password
   */
  async updatePassword(password: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw new ApiException(
          ErrorCode.AUTHENTICATION_ERROR,
          error.message,
        );
      }
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      
      throw new ApiException(
        ErrorCode.AUTHENTICATION_ERROR,
        'Failed to update password',
      );
    }
  },

  /**
   * Verify a user's email
   * @param token Verification token
   */
  async verifyEmail(token: string) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) {
        throw new ApiException(
          ErrorCode.AUTHENTICATION_ERROR,
          error.message,
        );
      }
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      
      throw new ApiException(
        ErrorCode.AUTHENTICATION_ERROR,
        'Failed to verify email',
      );
    }
  },

  /**
   * Get a user by ID (server-side only)
   * @param userId User ID
   * @returns User data
   */
  async getUserById(userId: string) {
    try {
      const { data, error } = await supabaseServer
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw new ApiException(
          ErrorCode.DATABASE_ERROR,
          error.message,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      
      throw new ApiException(
        ErrorCode.DATABASE_ERROR,
        'Failed to get user',
      );
    }
  },
};