import { supabase } from './client';
import { supabaseServer } from './server';
import { ApiException, ErrorCode } from '@/lib/api';
import { LoginRequest, PasswordResetRequest, PasswordUpdateRequest, RegisterRequest } from '@/lib/types';

/**
 * Authentication service for Supabase
 */
export const authService = {
  /**
   * Register a new user
   * @param params Registration parameters or email
   * @param password User password (if first param is email)
   * @returns User data
   */
  async register(params: RegisterRequest | string, password?: string) {
    let email: string;
    let userPassword: string;
    
    if (typeof params === 'string') {
      email = params;
      userPassword = password as string;
    } else {
      email = params.email;
      userPassword = params.password;
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: userPassword,
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
   * @param params Login parameters or email
   * @param password User password (if first param is email)
   * @returns User data
   */
  async login(params: LoginRequest | string, password?: string) {
    let email: string;
    let userPassword: string;
    
    if (typeof params === 'string') {
      email = params;
      userPassword = password as string;
    } else {
      email = params.email;
      userPassword = params.password;
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: userPassword,
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
   * Refresh the current session
   * @returns Refreshed session data
   */
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();

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
        'Failed to refresh session',
      );
    }
  },

  /**
   * Send a password reset email
   * @param params Password reset parameters or email
   */
  async resetPassword(params: PasswordResetRequest | string) {
    const email = typeof params === 'string' ? params : params.email;
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
   * @param params Password update parameters or password string
   */
  async updatePassword(params: PasswordUpdateRequest | string) {
    const password = typeof params === 'string' ? params : params.password;
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