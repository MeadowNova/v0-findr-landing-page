'use client';

import { useAuth as useAuthContext } from './AuthContext';

// Re-export the useAuth hook from AuthContext
export const useAuth = useAuthContext;

// Export a function to check if a user is authenticated on the client side
export const isAuthenticated = () => {
  try {
    const auth = useAuthContext();
    return auth.isAuthenticated;
  } catch (error) {
    return false;
  }
};

// Export a function to get the current user on the client side
export const getCurrentUser = () => {
  try {
    const auth = useAuthContext();
    return auth.user;
  } catch (error) {
    return null;
  }
};

// Export a function to get the current session on the client side
export const getCurrentSession = () => {
  try {
    const auth = useAuthContext();
    return auth.session;
  } catch (error) {
    return null;
  }
};