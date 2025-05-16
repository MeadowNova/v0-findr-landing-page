'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Container,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';

export default function Navbar() {
  const { isOpen, onToggle } = useDisclosure();
  const pathname = usePathname();

  return (
    <Box
      as="nav"
      bg={useColorModeValue('white', 'gray.800')}
      color={useColorModeValue('gray.600', 'white')}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Container maxW="container.xl">
        <Flex
          minH={'60px'}
          py={{ base: 2 }}
          align={'center'}
        >
          <Flex
            flex={{ base: 1, md: 'auto' }}
            ml={{ base: -2 }}
            display={{ base: 'flex', md: 'none' }}
          >
            <IconButton
              onClick={onToggle}
              icon={
                isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
              }
              variant={'ghost'}
              aria-label={'Toggle Navigation'}
            />
          </Flex>
          <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
            <Link href="/" passHref>
              <Text
                textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                fontFamily={'heading'}
                color={useColorModeValue('gray.800', 'white')}
                fontWeight="bold"
                fontSize="xl"
                cursor="pointer"
              >
                Snagr AI
              </Text>
            </Link>

            <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
              <DesktopNav pathname={pathname} />
            </Flex>
          </Flex>

          <Stack
            flex={{ base: 1, md: 0 }}
            justify={'flex-end'}
            direction={'row'}
            spacing={6}
          >
            <Button
              as={Link}
              href="/matches"
              fontSize={'sm'}
              fontWeight={400}
              variant={'link'}
              color={pathname === '/matches' ? 'purple.500' : undefined}
            >
              Matches
            </Button>
            <Button
              as={Link}
              href="/unlocks"
              display={{ base: 'none', md: 'inline-flex' }}
              fontSize={'sm'}
              fontWeight={600}
              color={'white'}
              bg={'purple.500'}
              _hover={{
                bg: 'purple.600',
              }}
            >
              My Unlocks
            </Button>
          </Stack>
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <MobileNav pathname={pathname} />
        </Collapse>
      </Container>
    </Box>
  );
}

const DesktopNav = ({ pathname }: { pathname: string }) => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const activeColor = useColorModeValue('purple.500', 'purple.300');

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link href={navItem.href ?? '#'} passHref>
                <Box
                  p={2}
                  fontSize={'sm'}
                  fontWeight={500}
                  color={pathname === navItem.href ? activeColor : linkColor}
                  _hover={{
                    textDecoration: 'none',
                    color: linkHoverColor,
                  }}
                  cursor="pointer"
                >
                  {navItem.label}
                </Box>
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={useColorModeValue('white', 'gray.800')}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Link href={href ?? '#'} passHref>
      <Box
        role={'group'}
        display={'block'}
        p={2}
        rounded={'md'}
        _hover={{ bg: useColorModeValue('purple.50', 'gray.900') }}
        cursor="pointer"
      >
        <Stack direction={'row'} align={'center'}>
          <Box>
            <Text
              transition={'all .3s ease'}
              _groupHover={{ color: 'purple.500' }}
              fontWeight={500}
            >
              {label}
            </Text>
            <Text fontSize={'sm'}>{subLabel}</Text>
          </Box>
          <Flex
            transition={'all .3s ease'}
            transform={'translateX(-10px)'}
            opacity={0}
            _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
            justify={'flex-end'}
            align={'center'}
            flex={1}
          >
            <Icon color={'purple.500'} w={5} h={5} as={ChevronRightIcon} />
          </Flex>
        </Stack>
      </Box>
    </Link>
  );
};

const MobileNav = ({ pathname }: { pathname: string }) => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} isActive={pathname === navItem.href} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href, isActive }: NavItemWithActive) => {
  const { isOpen, onToggle } = useDisclosure();
  const activeColor = useColorModeValue('purple.500', 'purple.300');

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={Link}
        href={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text
          fontWeight={600}
          color={isActive ? activeColor : useColorModeValue('gray.600', 'gray.200')}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link key={child.label} href={child.href ?? '#'} passHref>
                <Box py={2} cursor="pointer">
                  {child.label}
                </Box>
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
}

interface NavItemWithActive extends NavItem {
  isActive?: boolean;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Matches',
    href: '/matches',
  },
  {
    label: 'Unlocks',
    href: '/unlocks',
  },
  {
    label: 'Payment',
    children: [
      {
        label: 'Success',
        subLabel: 'View successful payments',
        href: '/payment/success',
      },
      {
        label: 'Cancel',
        subLabel: 'View cancelled payments',
        href: '/payment/cancel',
      },
    ],
  },
];
