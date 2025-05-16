'use client';

import { useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { apiClient } from '@/lib/api/client';

interface CheckoutButtonProps {
  matchId: string;
  isDisabled?: boolean;
}

export default function CheckoutButton({ matchId, isDisabled = false }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/payments/create-checkout', {
        matchId,
      });
      
      // Redirect to Stripe Checkout
      const { session } = response.data;
      if (session?.url) {
        window.location.href = session.url;
      } else {
        throw new Error('Invalid checkout session');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to initiate payment process',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  return (
    <Button
      colorScheme="purple"
      size="lg"
      width="full"
      isLoading={isLoading}
      loadingText="Redirecting to Checkout..."
      onClick={handleCheckout}
      isDisabled={isDisabled}
    >
      Unlock Match
    </Button>
  );
}
