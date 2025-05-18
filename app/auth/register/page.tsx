import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account | SnagrAI',
  description: 'Create a new SnagrAI account',
};

export default function RegisterPage() {
  return <RegisterForm />;
}