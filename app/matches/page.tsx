'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchClient } from '@/lib/services/search-client';
import { SearchResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/useAuth';

export default function MatchesPage() {
  const searchParams = useSearchParams();
  const searchId = searchParams.get('searchId');
  const { isAuthenticated } = useAuth();
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  // Load search results if searchId is provided
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (searchId) {
      fetchSearchResults(searchId);
    } else {
      setIsLoading(false);
    }
  }, [searchId, isAuthenticated]);

  // Poll job status if jobId is available
  useEffect(() => {
    if (!jobId || !isAuthenticated) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const status = await searchClient.getSearchJobStatus(jobId);
        setJobStatus(status.status);

        if (status.status === 'completed' && searchId) {
          fetchSearchResults(searchId);
          clearInterval(interval);
        } else if (status.status === 'failed') {
          setError('Search job failed. Please try again.');
          clearInterval(interval);
        }
      } catch (err: any) {
        console.error('Error checking job status:', err);
        setError(err.message || 'Failed to check job status');
        clearInterval(interval);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [jobId, searchId, isAuthenticated]);

  const fetchSearchResults = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await searchClient.getSearchResults(id);
      setResults(data.results);
      
      if (data.jobId && data.jobStatus !== 'completed') {
        setJobId(data.jobId);
        setJobStatus(data.jobStatus);
      } else {
        setJobId(null);
        setJobStatus(null);
      }
    } catch (err: any) {
      console.error('Error fetching search results:', err);
      setError(err.message || 'Failed to fetch search results');
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
              You need to be logged in to view your matches.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Please log in or create an account to start searching and view your matches.
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
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Matches</h1>

        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* No search ID provided */}
        {!searchId && !isLoading && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>No Active Search</CardTitle>
              <CardDescription>
                You haven't started a search yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Start a new search to find what you're looking for on Facebook Marketplace.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/search">Start a New Search</Link>
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Job status */}
        {jobStatus && jobStatus !== 'completed' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search in Progress</CardTitle>
              <CardDescription>
                We're searching Facebook Marketplace for your items.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                <div>
                  <p className="text-gray-500">
                    Status: <span className="font-medium capitalize">{jobStatus}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    This may take a few minutes. You can leave this page and come back later.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading state */}
        {isLoading && !jobStatus && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <Card key={result.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  {result.imageUrl ? (
                    <img
                      src={result.imageUrl}
                      alt={result.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white px-2 py-1 rounded text-sm font-medium">
                    ${result.price}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{result.title}</CardTitle>
                  <CardDescription className="line-clamp-1">
                    {result.location || 'Location not specified'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {result.description || 'No description available'}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    Save
                  </Button>
                  <Button size="sm" asChild>
                    <a href={result.url} target="_blank" rel="noopener noreferrer">
                      View Listing
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && searchId && results.length === 0 && !jobStatus && (
          <Card>
            <CardHeader>
              <CardTitle>No Matches Found</CardTitle>
              <CardDescription>
                We couldn't find any matches for your search criteria.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Try broadening your search terms or adjusting your filters.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/search">Try a New Search</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}