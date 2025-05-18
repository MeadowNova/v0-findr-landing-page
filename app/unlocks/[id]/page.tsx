'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UnlockWithDetails } from '@/lib/types';

export default function UnlockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const unlockId = params.id as string;
  
  const [unlock, setUnlock] = useState<UnlockWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  
  useEffect(() => {
    const fetchUnlock = async () => {
      try {
        // In a real implementation, you would fetch the unlock details from your API
        // For this example, we'll create a mock unlock
        const mockUnlock: UnlockWithDetails = {
          id: unlockId,
          match: {
            id: '1',
            title: 'Vintage Camera Collection',
            price: 499.99,
            imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            description: 'A collection of vintage cameras in excellent condition. Includes models from the 1950s to 1980s.',
            location: 'San Francisco, CA',
            listingUrl: 'https://example.com/listing/123',
            sellerInfo: {
              name: 'John Doe',
              rating: '4.5',
              joinedDate: '2020-01-01'
            },
            search: {
              id: 'search_123',
              queryText: 'vintage cameras'
            }
          },
          payment: {
            id: 'pay_123',
            amount: 4.99,
            currency: 'usd',
            status: 'completed',
            createdAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString()
        };
        
        setUnlock(mockUnlock);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching unlock:', err);
        setError(err.message || 'Failed to load unlock details');
        setIsLoading(false);
      }
    };
    
    fetchUnlock();
  }, [unlockId]);
  
  const handleCopyMessage = () => {
    if (unlock) {
      const message = `Hi! I'm interested in your ${unlock.match.title} listing for $${unlock.match.price.toFixed(2)}. Is it still available?`;
      navigator.clipboard.writeText(message);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };
  
  const handleVisitListing = () => {
    if (unlock?.match?.listingUrl) {
      window.open(unlock.match.listingUrl, '_blank');
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-5/6"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }
  
  if (!unlock) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Unlock not found
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <img
          src={unlock.match.imageUrl}
          alt={unlock.match.title}
          className="rounded-lg object-cover w-full h-96"
        />
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{unlock.match.title}</h1>
        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-lg font-medium">
          ${unlock.match.price.toFixed(2)}
        </span>
      </div>
      
      <div className="flex items-center text-purple-600 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">Unlocked on {new Date(unlock.createdAt).toLocaleDateString()}</span>
      </div>
      
      <p className="text-lg text-gray-600 mb-6">
        {unlock.match.description}
      </p>
      
      <div className="flex mb-6">
        <div className="flex-1">
          <p className="font-bold">Location</p>
          <p>{unlock.match.location}</p>
        </div>
        <div className="flex-1">
          <p className="font-bold">Payment</p>
          <p>${unlock.payment.amount.toFixed(2)} ({unlock.payment.status})</p>
        </div>
      </div>
      
      <hr className="mb-6" />
      
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">Seller Information</h2>
        <div className="space-y-2">
          <div className="flex">
            <span className="font-bold w-24">Name:</span>
            <span>{unlock.match.sellerInfo?.name || 'Not available'}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-24">Rating:</span>
            <span>{unlock.match.sellerInfo?.rating || 'Not available'}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-24">Member since:</span>
            <span>{unlock.match.sellerInfo?.joinedDate ? new Date(unlock.match.sellerInfo.joinedDate).toLocaleDateString() : 'Not available'}</span>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">Suggested Message</h2>
        <textarea
          value={`Hi! I'm interested in your ${unlock.match.title} listing for $${unlock.match.price.toFixed(2)}. Is it still available?`}
          readOnly
          className="w-full border rounded p-2 mb-4 h-24"
        />
        <button
          onClick={handleCopyMessage}
          className={`flex items-center ${hasCopied ? 'bg-green-500' : 'bg-purple-600'} text-white px-3 py-1 rounded text-sm`}
        >
          {hasCopied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
              </svg>
              Copy Message
            </>
          )}
        </button>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => router.push('/unlocks')}
          className="border border-gray-300 px-4 py-2 rounded"
        >
          Back to Unlocks
        </button>
        
        {unlock.match.listingUrl && (
          <button
            onClick={handleVisitListing}
            className="bg-purple-600 text-white px-4 py-2 rounded flex items-center"
          >
            Visit Original Listing
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}