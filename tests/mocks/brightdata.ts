import { BrightDataResult } from '@/lib/services/brightdata';

// Mock search parameters
export const mockSearchParams = {
  query: 'vintage chair',
  location: 'New York, NY',
  radius: 25,
  minPrice: 50,
  maxPrice: 500,
  category: 'Furniture',
  limit: 10
};

// Mock Bright Data API response
export const mockBrightDataApiResponse = {
  results: [
    {
      id: 'fb-123456789',
      title: 'Vintage Mid-Century Chair',
      price: '$150',
      location: 'Brooklyn, NY',
      distance: '5 miles',
      url: 'https://facebook.com/marketplace/item/123456789',
      image_url: 'https://example.com/image1.jpg',
      description: 'Beautiful vintage chair in excellent condition',
      condition: 'Good',
      category: 'Furniture',
      seller_name: 'John Doe',
      seller_rating: '4.8',
      seller_joined_date: '2019-01-01',
      seller_profile_url: 'https://facebook.com/profile/johndoe',
      posted_at: '2023-05-15T14:30:00Z'
    },
    {
      id: 'fb-987654321',
      title: 'Antique Wooden Chair',
      price: '$200',
      location: 'Manhattan, NY',
      distance: '3 miles',
      url: 'https://facebook.com/marketplace/item/987654321',
      image_url: 'https://example.com/image2.jpg',
      description: 'Antique wooden chair from the 1950s',
      condition: 'Like New',
      category: 'Furniture',
      seller_name: 'Jane Smith',
      seller_rating: '4.5',
      seller_joined_date: '2020-03-15',
      seller_profile_url: 'https://facebook.com/profile/janesmith',
      posted_at: '2023-05-16T10:15:00Z'
    }
  ]
};

// Mock Bright Data results (after processing)
export const mockBrightDataResults: BrightDataResult[] = [
  {
    listingId: 'fb-123456789',
    title: 'Vintage Mid-Century Chair',
    price: 150,
    currency: 'USD',
    location: 'Brooklyn, NY',
    distance: 5,
    listingUrl: 'https://facebook.com/marketplace/item/123456789',
    imageUrl: 'https://example.com/image1.jpg',
    description: 'Beautiful vintage chair in excellent condition',
    condition: 'Good',
    category: 'Furniture',
    sellerInfo: {
      name: 'John Doe',
      rating: '4.8',
      joinedDate: '2019-01-01',
      profileUrl: 'https://facebook.com/profile/johndoe'
    },
    postedAt: '2023-05-15T14:30:00Z'
  },
  {
    listingId: 'fb-987654321',
    title: 'Antique Wooden Chair',
    price: 200,
    currency: 'USD',
    location: 'Manhattan, NY',
    distance: 3,
    listingUrl: 'https://facebook.com/marketplace/item/987654321',
    imageUrl: 'https://example.com/image2.jpg',
    description: 'Antique wooden chair from the 1950s',
    condition: 'Like New',
    category: 'Furniture',
    sellerInfo: {
      name: 'Jane Smith',
      rating: '4.5',
      joinedDate: '2020-03-15',
      profileUrl: 'https://facebook.com/profile/janesmith'
    },
    postedAt: '2023-05-16T10:15:00Z'
  }
];

// Mock create/update preset response
export const mockCreatePresetResponse = {
  preset_id: 'preset-123456',
  name: 'fb-marketplace-scraper',
  status: 'active'
};

// Mock test preset response
export const mockTestPresetResponse = {
  success: true,
  data: {
    title: 'Test Item',
    price: '$100',
    location: 'Test Location',
    description: 'Test description'
  }
};

// Mock quota response
export const mockQuotaResponse = {
  total: 1000,
  used: 250,
  remaining: 750,
  reset_date: '2023-06-01T00:00:00Z'
};

// Mock error response
export const mockErrorResponse = {
  message: 'API request failed',
  error_code: 'EXTERNAL_SERVICE_ERROR',
  details: {
    reason: 'Invalid API key'
  }
};