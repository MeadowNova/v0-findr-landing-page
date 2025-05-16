'use client';

import { useRouter } from 'next/navigation';
import { Button, Card, Container, Flex, Heading, Text } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';

export default function PaymentCancelPage() {
  const router = useRouter();
  
  return (
    <Container maxW="container.md" py={10}>
      <Card p={8} borderRadius="lg" boxShadow="lg">
        <Flex direction="column" align="center" textAlign="center" gap={6}>
          <WarningIcon boxSize={16} color="orange.500" />
          <Heading size="lg">Payment Cancelled</Heading>
          <Text color="gray.600">
            Your payment has been cancelled and you have not been charged.
            You can try again or return to your matches.
          </Text>
          <Flex gap={4}>
            <Button colorScheme="gray" onClick={() => router.push('/matches')}>
              Return to Matches
            </Button>
            <Button colorScheme="purple" onClick={() => router.back()}>
              Try Again
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Container>
  );
}
