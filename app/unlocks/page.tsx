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
  Icon,
} from '@chakra-ui/react';
import { LockIcon, UnlockIcon } from '@chakra-ui/icons';
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
      <Container maxW="container.xl" py={8}>
        <Heading mb={6}>Your Unlocked Matches</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {[1, 2].map((i) => (
            <Card key={i} maxW="md">
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
  
  if (unlocks.length === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <Heading mb={6}>Your Unlocked Matches</Heading>
        <Card p={6} textAlign="center">
          <CardBody>
            <Icon as={LockIcon} boxSize={12} color="gray.400" mb={4} />
            <Heading size="md" mb={2}>No Unlocked Matches Yet</Heading>
            <Text color="gray.600" mb={4}>
              You haven't unlocked any matches yet. Unlock a match to view seller contact information.
            </Text>
            <Button colorScheme="purple" onClick={() => router.push('/matches')}>
              Browse Matches
            </Button>
          </CardBody>
        </Card>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Your Unlocked Matches</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {unlocks.map((unlock) => (
          <Card key={unlock.id} maxW="md" overflow="hidden">
            <Image
              src={unlock.match.imageUrl}
              alt={unlock.match.title}
              height="200px"
              objectFit="cover"
            />
            <CardBody>
              <Stack spacing={3}>
                <Flex justify="space-between" align="center">
                  <Heading size="md">{unlock.match.title}</Heading>
                  <Badge colorScheme="green">${unlock.match.price.toFixed(2)}</Badge>
                </Flex>
                <Text color="gray.600" noOfLines={2}>
                  {unlock.match.description}
                </Text>
                <Flex align="center" color="purple.500">
                  <UnlockIcon mr={2} />
                  <Text fontWeight="medium">Unlocked on {new Date(unlock.unlockedAt).toLocaleDateString()}</Text>
                </Flex>
                <Box bg="gray.50" p={3} borderRadius="md">
                  <Text fontWeight="bold" mb={1}>Seller Contact:</Text>
                  <Text>{unlock.match.sellerInfo.name}</Text>
                  <Text>{unlock.match.sellerInfo.email}</Text>
                  <Text>{unlock.match.sellerInfo.phone}</Text>
                </Box>
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <ButtonGroup spacing={2}>
                <Button 
                  variant="solid" 
                  colorScheme="purple"
                  onClick={() => handleViewUnlock(unlock.id)}
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
