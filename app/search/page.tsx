'use client';

import { Metadata } from 'next';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import SearchForm from '@/components/search/SearchForm';
import SearchHistory from '@/components/search/SearchHistory';
import { searchClient } from '@/lib/services/search-client';
import { SearchParams } from '@/lib/types/search';
import { useAuth } from '@/lib/auth/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Metadata is moved to layout.tsx since this is a client component

export default function SearchPage() {
  const searchParams = useSearchParams();
  const searchId = searchParams.get('id');
  const { isAuthenticated } = useAuth();
  const [defaultValues, setDefaultValues] = useState<Partial<SearchParams>>();
  const [isLoading, setIsLoading] = useState(false);

  // If a search ID is provided, load the search parameters
  useEffect(() => {
    if (searchId && isAuthenticated) {
      loadSearchParams(searchId);
    }
  }, [searchId, isAuthenticated]);

  // Load search parameters from a previous search
  const loadSearchParams = async (id: string) => {
    setIsLoading(true);
    try {
      const history = await searchClient.getSearchHistory();
      const search = history.searches.find(s => s.id === id);
      
      if (search) {
        setDefaultValues({
          query: search.query,
          location: search.location,
          minPrice: search.minPrice,
          maxPrice: search.maxPrice,
          category: search.category,
          radius: search.radius,
          sortBy: search.sortBy,
        });
      }
    } catch (error) {
      console.error('Error loading search parameters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to search on Facebook Marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Please log in or create an account to start searching for items.
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-6">Find What You're Looking For</h1>
          <SearchForm defaultValues={defaultValues} />
        </div>
        <div>
          <SearchHistory className="mt-8 lg:mt-0" />
        </div>
      </div>
    </div>
  );
}