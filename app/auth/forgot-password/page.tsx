import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password | SnagrAI',
  description: 'Reset your SnagrAI account password',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}