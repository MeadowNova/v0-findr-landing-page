import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | SnagrAI',
  description: 'Sign in to your SnagrAI account',
};

export default function LoginPage() {
  return <LoginForm />;
}