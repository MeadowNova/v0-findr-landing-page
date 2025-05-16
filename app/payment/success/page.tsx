'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, Container, Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { apiClient } from '@/lib/api/client';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlockData, setUnlockData] = useState<any>(null);
  
  useEffect(() => {
    if (!sessionId) {
      setError('Invalid session ID');
      setIsLoading(false);
      return;
    }
    
    const confirmCheckout = async () => {
      try {
        const response = await apiClient.post('/payments/confirm-checkout', {
          sessionId,
        });
        
        setUnlockData(response.data);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error confirming checkout:', err);
        setError(err.message || 'Failed to confirm payment');
        setIsLoading(false);
      }
    };
    
    confirmCheckout();
  }, [sessionId]);
  
  const handleViewMatch = () => {
    if (unlockData?.unlock?.id) {
      router.push(`/unlocks/${unlockData.unlock.id}`);
    } else {
      router.push('/unlocks');
    }
  };
  
  return (
    <Container maxW="container.md" py={10}>
      <Card p={8} borderRadius="lg" boxShadow="lg">
        <Flex direction="column" align="center" textAlign="center" gap={6}>
          {isLoading ? (
            <>
              <Spinner size="xl" color="purple.500" thickness="4px" speed="0.65s" />
              <Heading size="lg">Processing your payment...</Heading>
              <Text color="gray.600">
                Please wait while we confirm your payment and unlock your match.
              </Text>
            </>
          ) : error ? (
            <>
              <Heading size="lg" color="red.500">Payment Error</Heading>
              <Text color="gray.600">{error}</Text>
              <Button colorScheme="purple" onClick={() => router.push('/matches')}>
                Return to Matches
              </Button>
            </>
          ) : (
            <>
              <CheckCircleIcon boxSize={16} color="green.500" />
              <Heading size="lg">Payment Successful!</Heading>
              <Text color="gray.600">
                Your payment has been processed successfully and your match has been unlocked.
                You can now view the seller's contact information and reach out to them.
              </Text>
              <Button colorScheme="purple" size="lg" onClick={handleViewMatch}>
                View Unlocked Match
              </Button>
            </>
          )}
        </Flex>
      </Card>
    </Container>
  );
}
