'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get('matchId');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<any>(null);
  
  useEffect(() => {
    const processPayment = async () => {
      if (!matchId) {
        setError('No match ID provided');
        setIsLoading(false);
        return;
      }
      
      try {
        // In a real implementation, you would call your API to process the payment
        // and unlock the match
        
        // For this example, we'll create a mock match with seller info
        const mockMatch = {
          id: matchId,
          title: 'Vintage Camera Collection',
          price: 499.99,
          description: 'A collection of vintage cameras in excellent condition.',
          imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          location: 'San Francisco, CA',
          postedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          sellerInfo: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1 (555) 123-4567',
          },
          marketplaceUrl: 'https://www.facebook.com/marketplace/item/123456789',
          suggestedMessage: "Hi! I'm interested in your Vintage Camera Collection listing for $499.99. Is it still available?",
        };
        
        setMatch(mockMatch);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error processing payment:', err);
        setError(err.message || 'Failed to process payment');
        setIsLoading(false);
      }
    };
    
    processPayment();
  }, [matchId]);
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }
  
  if (error || !match) {
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
              <p className="text-sm text-red-700">{error || 'Failed to process payment'}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/matches"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Matches
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="mt-2 text-sm text-gray-500">
            You've successfully unlocked the seller's contact information.
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="h-16 w-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                <img
                  src={match.imageUrl}
                  alt={match.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{match.title}</h3>
                <p className="text-sm text-gray-500">{match.location}</p>
                <p className="text-sm font-medium text-gray-900">${match.price.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-base font-medium text-gray-900 mb-2">Seller Information</h4>
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-sm text-gray-700"><span className="font-medium">Name:</span> {match.sellerInfo.name}</p>
                <p className="text-sm text-gray-700"><span className="font-medium">Email:</span> {match.sellerInfo.email}</p>
                <p className="text-sm text-gray-700"><span className="font-medium">Phone:</span> {match.sellerInfo.phone}</p>
              </div>
              
              <h4 className="text-base font-medium text-gray-900 mb-2">Marketplace Listing</h4>
              <div className="mb-4">
                <a
                  href={match.marketplaceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  View Original Listing on Facebook Marketplace
                </a>
              </div>
              
              <h4 className="text-base font-medium text-gray-900 mb-2">Suggested Message</h4>
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-sm text-gray-700">{match.suggestedMessage}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(match.suggestedMessage);
                    alert('Message copied to clipboard!');
                  }}
                  className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Link
            href="/matches"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Matches
          </Link>
          <Link
            href="/unlocks"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View All Unlocks
          </Link>
        </div>
      </div>
    </div>
  );
}