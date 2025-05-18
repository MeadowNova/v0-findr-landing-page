'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchParams } from '@/lib/types/search';
import { searchClient } from '@/lib/services/search-client';
import { useAuth } from '@/lib/auth/useAuth';

// Define the form schema using Zod
const searchFormSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters').max(100, 'Search query cannot exceed 100 characters'),
  location: z.string().optional(),
  radius: z.number().min(1).max(100).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional()
    .refine(val => val === undefined || val === 0 || (val !== undefined && val > 0), {
      message: 'Maximum price must be greater than 0',
    }),
  category: z.string().optional(),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'date']).default('relevance'),
});

// Infer the form values type from the schema
type SearchFormValues = z.infer<typeof searchFormSchema>;

// Categories for the dropdown
const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'property_rentals', label: 'Property Rentals' },
  { value: 'property_for_sale', label: 'Property For Sale' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'household', label: 'Household' },
  { value: 'baby_kids', label: 'Baby & Kids' },
  { value: 'toys_games', label: 'Toys & Games' },
  { value: 'sports_outdoors', label: 'Sports & Outdoors' },
  { value: 'tools', label: 'Tools' },
  { value: 'pet_supplies', label: 'Pet Supplies' },
  { value: 'musical_instruments', label: 'Musical Instruments' },
  { value: 'collectibles', label: 'Collectibles' },
  { value: 'books_movies_music', label: 'Books, Movies & Music' },
  { value: 'other', label: 'Other' },
];

// Sort options for the dropdown
const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'date', label: 'Newest First' },
];

interface SearchFormProps {
  className?: string;
  defaultValues?: Partial<SearchFormValues>;
  onSearchComplete?: (searchId: string, jobId: string) => void;
}

export default function SearchForm({ 
  className = '', 
  defaultValues,
  onSearchComplete 
}: SearchFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Initialize react-hook-form with zod validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      query: '',
      location: '',
      radius: 25,
      minPrice: 0,
      maxPrice: 1000,
      category: 'all',
      sortBy: 'relevance',
      ...defaultValues,
    },
  });

  // Watch form values for real-time updates
  const watchedValues = watch();

  // Handle price range slider change
  const handlePriceRangeChange = (values: number[]) => {
    const [min, max] = values;
    setPriceRange([min, max]);
    setValue('minPrice', min);
    setValue('maxPrice', max);
  };

  // Handle form submission
  const onSubmit = async (data: SearchFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // If user is not authenticated, redirect to login page
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=search');
        return;
      }

      // Clean up the data
      const searchParams: SearchParams = {
        ...data,
        // Remove empty strings and convert them to undefined
        location: data.location && data.location.trim() !== '' ? data.location : undefined,
        // Remove 'all' category as it's not needed for the API
        category: data.category !== 'all' ? data.category : undefined,
      };

      // Call the search API
      const { searchId, jobId } = await searchClient.createSearch(searchParams);

      // If onSearchComplete callback is provided, call it
      if (onSearchComplete) {
        onSearchComplete(searchId, jobId);
      } else {
        // Otherwise, redirect to the matches page with the search ID
        router.push(`/matches?searchId=${searchId}`);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred while creating the search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle>Find What You're Looking For</CardTitle>
        <CardDescription>
          Tell us what you want, and we'll hunt it down for you on Facebook Marketplace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="query">What are you looking for?</Label>
            <Input
              id="query"
              placeholder="e.g., Vintage leather couch, PS5, iPhone 13..."
              {...register('query')}
            />
            {errors.query && (
              <p className="text-sm text-red-500">{errors.query.message}</p>
            )}
          </div>

          {/* Location and Radius */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location (City, State)</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                {...register('location')}
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="radius">Search Radius (miles)</Label>
              <Select
                onValueChange={(value) => setValue('radius', parseInt(value, 10))}
                defaultValue={watchedValues.radius?.toString() || '25'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 miles</SelectItem>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="50">50 miles</SelectItem>
                  <SelectItem value="100">100 miles</SelectItem>
                </SelectContent>
              </Select>
              {errors.radius && (
                <p className="text-sm text-red-500">{errors.radius.message}</p>
              )}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Price Range</Label>
              <div className="text-sm text-gray-500">
                ${priceRange[0]} - ${priceRange[1] === 5000 ? '5000+' : priceRange[1]}
              </div>
            </div>
            <Slider
              defaultValue={[0, 1000]}
              min={0}
              max={5000}
              step={50}
              value={[watchedValues.minPrice || 0, watchedValues.maxPrice || 1000]}
              onValueChange={handlePriceRangeChange}
              className="my-4"
            />
            {(errors.minPrice || errors.maxPrice) && (
              <p className="text-sm text-red-500">
                {errors.minPrice?.message || errors.maxPrice?.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              onValueChange={(value) => setValue('category', value)}
              defaultValue={watchedValues.category || 'all'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sortBy">Sort Results By</Label>
            <Select
              onValueChange={(value) => setValue('sortBy', value as any)}
              defaultValue={watchedValues.sortBy || 'relevance'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sortBy && (
              <p className="text-sm text-red-500">{errors.sortBy.message}</p>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit(onSubmit)} 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Searching...
            </div>
          ) : (
            'Search Now'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}