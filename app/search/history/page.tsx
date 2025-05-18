'use client';

import { useAuth } from '@/lib/auth/useAuth';
import SearchHistory from '@/components/search/SearchHistory';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SearchHistoryPage() {
  const { isAuthenticated } = useAuth();

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to view your search history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Please log in or create an account to start searching and view your search history.
            </p>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button variant="outline" asChild>
              <Link href="/auth/register">Sign Up</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Search History</h1>
          <Button asChild>
            <Link href="/search">New Search</Link>
          </Button>
        </div>
        
        <SearchHistory limit={20} showViewAll={false} />
      </div>
    </div>
  );
}