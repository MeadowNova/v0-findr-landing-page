import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search | SnagrAI',
  description: 'Search for items on Facebook Marketplace',
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}