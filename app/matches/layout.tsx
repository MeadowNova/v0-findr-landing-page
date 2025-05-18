import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Matches | SnagrAI',
  description: 'View your Facebook Marketplace matches',
};

export default function MatchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}