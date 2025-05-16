'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Image,
  Stack,
  Text,
  Divider,
  CardFooter,
  ButtonGroup,
  Button,
  Badge,
  Flex,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // In a real implementation, you would fetch matches from your API
        // For this example, we'll create mock matches
        const mockMatches = [
          {
            id: '1',
            title: 'Vintage Camera Collection',
            price: 499.99,
            description: 'A collection of vintage cameras in excellent condition.',
            imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            location: 'San Francisco, CA',
          },
          {
            id: '2',
            title: 'Mountain Bike - Like New',
            price: 850,
            description: 'High-quality mountain bike, barely used.',
            imageUrl: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            location: 'Denver, CO',
          },
          {
            id: '3',
            title: 'Antique Wooden Desk',
            price: 350,
            description: 'Beautiful antique desk in great condition.',
            imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            location: 'Portland, OR',
          },
          {
            id: '4',
            title: 'Gaming PC Setup',
            price: 1200,
            description: 'Complete gaming PC setup with monitor and accessories.',
            imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            location: 'Seattle, WA',
          },
        ];
        
        setMatches(mockMatches);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching matches:', err);
        setError(err.message || 'Failed to load matches');
        setIsLoading(false);
      }
    };
    
    fetchMatches();
  }, []);
  
  const handleViewMatch = (id: string) => {
    router.push(`/matches/${id}`);
  };
  
  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Heading mb={6}>Your Matches</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} maxW="sm">
              <Skeleton height="200px" />
              <CardBody>
                <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Your Matches</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
        {matches.map((match) => (
          <Card key={match.id} maxW="sm" overflow="hidden">
            <Image
              src={match.imageUrl}
              alt={match.title}
              height="200px"
              objectFit="cover"
            />
            <CardBody>
              <Stack spacing={3}>
                <Flex justify="space-between" align="center">
                  <Heading size="md">{match.title}</Heading>
                  <Badge colorScheme="green">${match.price.toFixed(2)}</Badge>
                </Flex>
                <Text color="gray.600" noOfLines={2}>
                  {match.description}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {match.location}
                </Text>
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <ButtonGroup spacing={2}>
                <Button 
                  variant="solid" 
                  colorScheme="purple"
                  onClick={() => handleViewMatch(match.id)}
                >
                  View Details
                </Button>
              </ButtonGroup>
            </CardFooter>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
