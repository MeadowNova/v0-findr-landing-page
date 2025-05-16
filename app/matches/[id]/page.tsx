'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  Flex,
  Badge,
  Divider,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { apiClient } from '@/lib/api/client';
import CheckoutButton from '@/components/payment/CheckoutButton';

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.id as string;
  const toast = useToast();
  
  const [match, setMatch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        // In a real implementation, you would fetch the match details from your API
        // For this example, we'll create a mock match
        const mockMatch = {
          id: matchId,
          title: 'Vintage Camera Collection',
          price: 499.99,
          description: 'A collection of vintage cameras in excellent condition. Includes models from the 1950s to 1980s.',
          imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          location: 'San Francisco, CA',
          createdAt: new Date().toISOString(),
          sellerInfo: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1 (555) 123-4567',
          },
        };
        
        // Check if the match is already unlocked
        // In a real implementation, you would check this from your API
        setIsUnlocked(false);
        
        setMatch(mockMatch);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching match:', err);
        setError(err.message || 'Failed to load match details');
        setIsLoading(false);
      }
    };
    
    fetchMatch();
  }, [matchId]);
  
  if (isLoading) {
    return (
      <Container maxW="container.md" py={8}>
        <Skeleton height="300px" mb={6} />
        <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.md" py={8}>
      <Box mb={8}>
        <Image
          src={match.imageUrl}
          alt={match.title}
          borderRadius="lg"
          objectFit="cover"
          width="100%"
          height="400px"
        />
      </Box>
      
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h1" size="xl">{match.title}</Heading>
        <Badge colorScheme="green" fontSize="lg" py={1} px={2}>
          ${match.price.toFixed(2)}
        </Badge>
      </Flex>
      
      <Text fontSize="lg" color="gray.600" mb={6}>
        {match.description}
      </Text>
      
      <Flex mb={6}>
        <Box flex="1">
          <Text fontWeight="bold">Location</Text>
          <Text>{match.location}</Text>
        </Box>
        <Box flex="1">
          <Text fontWeight="bold">Listed</Text>
          <Text>{new Date(match.createdAt).toLocaleDateString()}</Text>
        </Box>
      </Flex>
      
      <Divider mb={6} />
      
      {isUnlocked ? (
        <Card variant="outline" mb={6}>
          <CardBody>
            <Heading size="md" mb={4}>Seller Information</Heading>
            <Stack spacing={2}>
              <Flex>
                <Text fontWeight="bold" width="100px">Name:</Text>
                <Text>{match.sellerInfo.name}</Text>
              </Flex>
              <Flex>
                <Text fontWeight="bold" width="100px">Email:</Text>
                <Text>{match.sellerInfo.email}</Text>
              </Flex>
              <Flex>
                <Text fontWeight="bold" width="100px">Phone:</Text>
                <Text>{match.sellerInfo.phone}</Text>
              </Flex>
            </Stack>
          </CardBody>
        </Card>
      ) : (
        <Card variant="filled" bg="purple.50" mb={6}>
          <CardBody>
            <Heading size="md" mb={4}>Unlock Seller Information</Heading>
            <Text mb={4}>
              To view the seller's contact information and get in touch about this item,
              unlock this match for just $4.99.
            </Text>
            <CheckoutButton matchId={matchId} />
          </CardBody>
        </Card>
      )}
    </Container>
  );
}
