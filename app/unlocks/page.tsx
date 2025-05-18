'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api/client';

export default function UnlocksPage() {
  const router = useRouter();
  const [unlocks, setUnlocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUnlocks = async () => {
      try {
        // In a real implementation, you would fetch unlocks from your API
        // For this example, we'll create mock unlocks
        const mockUnlocks = [
          {
            id: '1',
            unlockedAt: new Date().toISOString(),
            match: {
              id: '1',
              title: 'Vintage Camera Collection',
              price: 499.99,
              description: 'A collection of vintage cameras in excellent condition.',
              imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              location: 'San Francisco, CA',
              sellerInfo: {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+1 (555) 123-4567',
              },
            },
            suggestedMessage: "Hi! I'm interested in your Vintage Camera Collection listing for $499.99. Is it still available?",
          },
        ];
        
        setUnlocks(mockUnlocks);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching unlocks:', err);
        setError(err.message || 'Failed to load unlocked matches');
        setIsLoading(false);
      }
    };
    
    fetchUnlocks();
  }, []);
  
  const handleViewUnlock = (id: string) => {
    router.push(`/unlocks/${id}`);
  };
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Unlocked Matches</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (unlocks.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Unlocked Matches</h1>
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="mt-2 text-lg font-medium text-gray-900">No Unlocked Matches Yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            You haven't unlocked any matches yet. Unlock a match to view seller contact information.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/matches')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Browse Matches
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Unlocked Matches</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {unlocks.map((unlock) => (
          <div key={unlock.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="h-48 bg-gray-200 relative">
              <img
                src={unlock.match.imageUrl}
                alt={unlock.match.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-medium text-gray-900">{unlock.match.title}</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ${unlock.match.price.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                {unlock.match.description}
              </p>
              <div className="flex items-center text-indigo-600 mb-3">
                <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                </svg>
                <span className="text-sm font-medium">Unlocked on {new Date(unlock.unlockedAt).toLocaleDateString()}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-sm font-bold text-gray-900 mb-1">Seller Contact:</p>
                <p className="text-sm text-gray-700">{unlock.match.sellerInfo.name}</p>
                <p className="text-sm text-gray-700">{unlock.match.sellerInfo.email}</p>
                <p className="text-sm text-gray-700">{unlock.match.sellerInfo.phone}</p>
              </div>
              <button
                onClick={() => handleViewUnlock(unlock.id)}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}