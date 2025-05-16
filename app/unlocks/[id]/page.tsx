'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Button,
  useToast,
  Icon,
  Textarea,
  useClipboard,
} from '@chakra-ui/react';
import { UnlockIcon, CopyIcon, CheckIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { apiClient } from '@/lib/api/client';

export default function UnlockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const unlockId = params.id as string;
  const toast = useToast();
  
  const [unlock, setUnlock] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { hasCopied, onCopy } = useClipboard(unlock?.suggestedMessage || '');
  
  useEffect(() => {
    const fetchUnlock = async () => {
      try {
        // In a real implementation, you would fetch the unlock details from your API
        // For this example, we'll create a mock unlock
        const mockUnlock = {
          id: unlockId,
          unlockedAt: new Date().toISOString(),
          match: {
            id: '1',
            title: 'Vintage Camera Collection',
            price: 499.99,
            description: 'A collection of vintage cameras in excellent condition. Includes models from the 1950s to 1980s.',
            imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            location: 'San Francisco, CA',
            listingUrl: 'https://example.com/listing/123',
            sellerInfo: {
              name: 'John Doe',
              email: 'john@example.com',
              phone: '+1 (555) 123-4567',
            },
          },
          suggestedMessage: "Hi! I'm interested in your Vintage Camera Collection listing for $499.99. Is it still available?",
          payment: {
            id: 'pay_123',
            amount: 4.99,
            currency: 'usd',
            status: 'completed',
            createdAt: new Date().toISOString(),
          },
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
    onCopy();
    toast({
      title: 'Message copied',
      status: 'success',
      duration: 2000,
    });
  };
  
  const handleVisitListing = () => {
    if (unlock?.match?.listingUrl) {
      window.open(unlock.match.listingUrl, '_blank');
    }
  };
  
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
          src={unlock.match.imageUrl}
          alt={unlock.match.title}
          borderRadius="lg"
          objectFit="cover"
          width="100%"
          height="400px"
        />
      </Box>
      
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h1" size="xl">{unlock.match.title}</Heading>
        <Badge colorScheme="green" fontSize="lg" py={1} px={2}>
          ${unlock.match.price.toFixed(2)}
        </Badge>
      </Flex>
      
      <Flex align="center" color="purple.500" mb={4}>
        <UnlockIcon mr={2} />
        <Text fontWeight="medium">Unlocked on {new Date(unlock.unlockedAt).toLocaleDateString()}</Text>
      </Flex>
      
      <Text fontSize="lg" color="gray.600" mb={6}>
        {unlock.match.description}
      </Text>
      
      <Flex mb={6}>
        <Box flex="1">
          <Text fontWeight="bold">Location</Text>
          <Text>{unlock.match.location}</Text>
        </Box>
        <Box flex="1">
          <Text fontWeight="bold">Payment</Text>
          <Text>${unlock.payment.amount.toFixed(2)} ({unlock.payment.status})</Text>
        </Box>
      </Flex>
      
      <Divider mb={6} />
      
      <Card variant="outline" mb={6}>
        <CardBody>
          <Heading size="md" mb={4}>Seller Information</Heading>
          <Stack spacing={2}>
            <Flex>
              <Text fontWeight="bold" width="100px">Name:</Text>
              <Text>{unlock.match.sellerInfo.name}</Text>
            </Flex>
            <Flex>
              <Text fontWeight="bold" width="100px">Email:</Text>
              <Text>{unlock.match.sellerInfo.email}</Text>
            </Flex>
            <Flex>
              <Text fontWeight="bold" width="100px">Phone:</Text>
              <Text>{unlock.match.sellerInfo.phone}</Text>
            </Flex>
          </Stack>
        </CardBody>
      </Card>
      
      <Card variant="outline" mb={6}>
        <CardBody>
          <Heading size="md" mb={4}>Suggested Message</Heading>
          <Textarea
            value={unlock.suggestedMessage}
            isReadOnly
            mb={4}
            rows={4}
          />
          <Button
            leftIcon={hasCopied ? <CheckIcon /> : <CopyIcon />}
            onClick={handleCopyMessage}
            colorScheme={hasCopied ? 'green' : 'purple'}
            size="sm"
          >
            {hasCopied ? 'Copied' : 'Copy Message'}
          </Button>
        </CardBody>
      </Card>
      
      <Flex justify="space-between">
        <Button
          variant="outline"
          onClick={() => router.push('/unlocks')}
        >
          Back to Unlocks
        </Button>
        
        {unlock.match.listingUrl && (
          <Button
            rightIcon={<ExternalLinkIcon />}
            colorScheme="purple"
            onClick={handleVisitListing}
          >
            Visit Original Listing
          </Button>
        )}
      </Flex>
    </Container>
  );
}
