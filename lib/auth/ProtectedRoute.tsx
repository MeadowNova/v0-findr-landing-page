'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
  requiredRole?: string;
}

/**
 * A component that protects routes that require authentication.
 * If the user is not authenticated, they will be redirected to the login page.
 *
 * @param children - The content to render if authenticated
 * @param redirectTo - Where to redirect if not authenticated
 * @param fallback - Optional component to show while checking authentication
 * @param requiredRole - Optional role required to access this route
 */
export default function ProtectedRoute({
  children,
  redirectTo = '/auth/login',
  fallback,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, session, isAuthenticated, isLoading, refreshSession } = useAuth();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndSession = async () => {
      // If still loading auth state, wait
      if (isLoading) return;

      // If not authenticated, redirect
      if (!isAuthenticated) {
        // Try to refresh the session before redirecting
        const refreshed = await refreshSession();
        if (!refreshed) {
          router.push(redirectTo);
        }
      } else if (requiredRole) {
        // Check if user has the required role
        const userRoles = user?.app_metadata?.roles || [];
        if (!userRoles.includes(requiredRole)) {
          // User doesn't have the required role
          router.push('/unauthorized');
        }
      }

      setIsCheckingSession(false);
    };

    checkAuthAndSession();
  }, [isAuthenticated, isLoading, redirectTo, router, refreshSession, user, requiredRole]);

  // Show loading state or fallback while checking
  if (isLoading || isCheckingSession) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-500">Verifying your session...</p>
        </div>
      </div>
    );
  }

  // If authenticated and has required role (if specified), show the children
  return isAuthenticated ? <>{children}</> : null;
}