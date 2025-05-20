'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

// Define the form schema using Zod
const registerSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Infer the form values type from the schema
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const { register: registerUser, isLoading, error, clearError, isAuthenticated } = useAuth();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const router = useRouter();

  // Initialize react-hook-form with zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  // Set focus to email field on component mount
  useEffect(() => {
    setFocus('email');
  }, [setFocus]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && formSubmitted && !registrationSuccess) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router, formSubmitted, registrationSuccess]);

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
  const onSubmit = async (data: RegisterFormValues) => {
    setFormSubmitted(true);
    try {
      await registerUser(data.email, data.password);
      setRegistrationSuccess(true);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  // If registration was successful, show success message
  if (registrationSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Registration Successful!</CardTitle>
          <CardDescription className="text-center">
            Your account has been created successfully. Please check your email to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Button asChild className="w-full mt-4">
            <Link href="/auth/login">Continue to Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
        <CardDescription className="text-center">
          Enter your details to create a new account
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              disabled={isLoading}
              {...register('email')}
              onChange={() => error && clearError()}
              className={errors.email ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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
            <Label htmlFor="confirmPassword">Confirm Password</Label>
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="acceptTerms"
              disabled={isLoading}
              {...register('acceptTerms')}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="acceptTerms" className="text-sm font-normal">
              I accept the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </Label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-500 mt-1">{errors.acceptTerms.message}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isSubmitting}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <p className="text-sm text-center">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}