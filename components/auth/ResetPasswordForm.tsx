'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, CheckCircle2, ArrowLeft, LockKeyhole } from 'lucide-react';

// Define the form schema using Zod
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Infer the form values type from the schema
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const { updatePassword, isLoading, error, clearError } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  // Initialize react-hook-form with zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
    watch,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Set focus to password field on component mount
  useEffect(() => {
    setFocus('password');
  }, [setFocus]);

  // Watch password for strength indicator
  const password = watch('password', '');

  // Calculate password strength
  const getPasswordStrength = (password: string) => {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  // Get strength text and color
  const getStrengthText = (strength: number) => {
    if (strength === 0) return { text: '', color: 'bg-gray-200' };
    if (strength === 1) return { text: 'Weak', color: 'bg-red-500' };
    if (strength === 2) return { text: 'Fair', color: 'bg-orange-500' };
    if (strength === 3) return { text: 'Good', color: 'bg-yellow-500' };
    if (strength === 4) return { text: 'Strong', color: 'bg-green-500' };
    return { text: 'Very Strong', color: 'bg-green-600' };
  };

  const strengthInfo = getStrengthText(passwordStrength);

  // Handle form submission
  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      const success = await updatePassword(data.password);
      if (success) {
        setIsSubmitted(true);
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  if (isSubmitted && !error) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Password Updated</CardTitle>
          <CardDescription className="text-center">
            Your password has been successfully updated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center mb-4">
            You can now use your new password to log in to your account.
          </p>
          <p className="text-center text-sm text-gray-500">
            You will be redirected to the login page in a few seconds...
          </p>
          <div className="flex justify-center mt-4">
            <Button asChild className="w-full">
              <Link href="/auth/login">Go to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <LockKeyhole className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Create a new secure password for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isLoading}
              {...register('password')}
              onChange={() => error && clearError()}
              className={errors.password ? "border-red-500 focus:ring-red-500" : ""}
            />
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-xs">{strengthInfo.text}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${strengthInfo.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isLoading}
              {...register('confirmPassword')}
              onChange={() => error && clearError()}
              className={errors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isSubmitting}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating password...
              </div>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <p className="text-sm text-center">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}