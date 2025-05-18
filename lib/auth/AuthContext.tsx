'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import { authService } from '../supabase/auth';
import { useRouter } from 'next/navigation';
import { tokenRefresh } from './tokenRefresh';

// Define the shape of our authentication context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  clearError: () => void;
  refreshSession: () => Promise<boolean>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const refreshIntervalRef = useRef<number | null>(null);

  // Check for session on initial load and set up token refresh
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get the current session and refresh if needed
        const refreshedSession = await tokenRefresh.getAndRefreshSessionIfNeeded();
        if (refreshedSession) {
          setSession(refreshedSession);
          setUser(refreshedSession.user);
        } else {
          // Try to get the current session if refresh failed
          const { data: { session } } = await supabase.auth.getSession();
          setSession(session);
          setUser(session?.user || null);
        }

        // Set up auth state listener
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          (_event, session) => {
            setSession(session);
            setUser(session?.user || null);
            setIsLoading(false);
          }
        );

        // Set up periodic token refresh if user is authenticated
        if (session) {
          const clearRefresh = tokenRefresh.setupPeriodicRefresh();
          // Store the cleanup function
          return () => {
            subscription.unsubscribe();
            clearRefresh();
          };
        }

        setIsLoading(false);

        // Cleanup subscription on unmount
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function with remember me option
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setSession(data.session);
      
      // If rememberMe is true, set up periodic token refresh
      if (rememberMe && data.session) {
        const clearRefresh = tokenRefresh.setupPeriodicRefresh(rememberMe ? 5 : 10); // More frequent refresh if remember me is enabled
        // Store the cleanup function
        if (refreshIntervalRef.current) {
          window.clearInterval(refreshIntervalRef.current);
        }
      }
      
      router.push('/'); // Redirect to home page after login
    } catch (error: any) {
      setError(error.message || 'Failed to login');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.register(email, password);
      setUser(data.user);
      setSession(data.session);
      router.push('/'); // Redirect to home page after registration
    } catch (error: any) {
      setError(error.message || 'Failed to register');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
      setSession(null);
      router.push('/auth/login'); // Redirect to login page after logout
    } catch (error: any) {
      setError(error.message || 'Failed to logout');
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(email);
      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to send password reset email');
      console.error('Reset password error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update password function
  const updatePassword = async (password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.updatePassword(password);
      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to update password');
      console.error('Update password error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Compute authentication status
  const isAuthenticated = !!user && !!session;

  // Function to manually refresh the session
  const refreshSession = async (): Promise<boolean> => {
    try {
      const refreshedSession = await tokenRefresh.refreshSession();
      if (refreshedSession) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  };

  // Create the value object that will be provided by the context
  const value = {
    user,
    session,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    clearError,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}