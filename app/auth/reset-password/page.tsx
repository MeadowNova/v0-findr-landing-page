'use client';

import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        setIsLoading(true);
        
        // Get the token from the URL
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        if (!token || type !== 'recovery') {
          setIsValidToken(false);
          setError('Invalid or missing password reset token');
          return;
        }

        // Verify the token with Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery',
        });

        if (error) {
          console.error('Error verifying token:', error);
          setIsValidToken(false);
          setError(error.message || 'Invalid or expired token');
        } else {
          setIsValidToken(true);
        }
      } catch (err) {
        console.error('Error in token verification:', err);
        setIsValidToken(false);
        setError('An error occurred while verifying your token');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Verifying Token</CardTitle>
          <CardDescription>
            Please wait while we verify your password reset token...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (isValidToken === false) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Invalid Token</CardTitle>
          <CardDescription>
            The password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-gray-500 mb-4">
            Please request a new password reset link to continue.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/forgot-password">Request New Link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <ResetPasswordForm />;
}