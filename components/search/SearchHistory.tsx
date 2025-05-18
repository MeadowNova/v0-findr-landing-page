'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { searchClient } from '@/lib/services/search-client';
import { SearchHistoryItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface SearchHistoryProps {
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

export default function SearchHistory({ 
  limit = 5, 
  showViewAll = true,
  className = '',
}: SearchHistoryProps) {
  const [searches, setSearches] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const fetchSearchHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await searchClient.getSearchHistory({ limit });
      setSearches(data.searches);
    } catch (err: any) {
      console.error('Error fetching search history:', err);
      setError(err.message || 'Failed to fetch search history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewResults = (searchId: string) => {
    router.push(`/matches?searchId=${searchId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (searches.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>No Search History</CardTitle>
          <CardDescription>
            You haven't performed any searches yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Start a new search to find what you're looking for on Facebook Marketplace.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <a href="/search">Start a New Search</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-4">Recent Searches</h2>
      <div className="space-y-4">
        {searches.map((search) => (
          <Card key={search.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{search.query}</CardTitle>
                {getStatusBadge(search.status)}
              </div>
              <CardDescription>
                {search.location ? `${search.location} • ` : ''}
                {search.createdAt && formatDistanceToNow(new Date(search.createdAt), { addSuffix: true })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-wrap gap-2">
                {search.category && (
                  <Badge variant="outline">{search.category}</Badge>
                )}
                {search.minPrice !== undefined && search.maxPrice !== undefined && (
                  <Badge variant="outline">
                    ${search.minPrice} - ${search.maxPrice}
                  </Badge>
                )}
                {search.radius && (
                  <Badge variant="outline">
                    {search.radius} miles
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="mr-2"
                onClick={() => router.push(`/search?id=${search.id}`)}
              >
                Repeat Search
              </Button>
              <Button 
                size="sm"
                onClick={() => handleViewResults(search.id)}
                disabled={search.status !== 'completed'}
              >
                View Results
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {showViewAll && searches.length >= limit && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => router.push('/search/history')}>
            View All Searches
          </Button>
        </div>
      )}
    </div>
  );
}