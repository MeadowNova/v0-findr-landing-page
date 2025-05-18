import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | SnagrAI',
  description: 'Reset your SnagrAI account password',
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}