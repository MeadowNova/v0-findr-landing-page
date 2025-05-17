'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center font-bold text-xl">
            Snagr AI
          </Link>
        </div>

        <div className="hidden md:flex md:items-center md:gap-6">
          <DesktopNav pathname={pathname} />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex md:items-center md:gap-2">
            <Link href="/matches">
              <Button variant="ghost" size="sm" className={pathname === '/matches' ? 'text-primary' : ''}>
                Matches
              </Button>
            </Link>
            <Link href="/unlocks">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                My Unlocks
              </Button>
            </Link>
          </div>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="md:hidden">
              <MobileNav pathname={pathname} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

const DesktopNav = ({ pathname }: { pathname: string }) => {
  return (
    <div className="flex items-center space-x-4">
      {NAV_ITEMS.map((navItem) => (
        <div key={navItem.label} className="relative">
          {navItem.children ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={pathname === navItem.href ? 'text-primary' : ''}
                >
                  {navItem.label}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {navItem.children.map((child) => (
                  <Link key={child.label} href={child.href ?? '#'}>
                    <DropdownMenuItem className="cursor-pointer">
                      <div>
                        <div className="font-medium">{child.label}</div>
                        {child.subLabel && (
                          <div className="text-xs text-muted-foreground">{child.subLabel}</div>
                        )}
                      </div>
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href={navItem.href ?? '#'}>
              <Button 
                variant="ghost" 
                size="sm"
                className={pathname === navItem.href ? 'text-primary' : ''}
              >
                {navItem.label}
              </Button>
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

const MobileNav = ({ pathname }: { pathname: string }) => {
  return (
    <div className="flex flex-col space-y-3 pt-4">
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem 
          key={navItem.label} 
          {...navItem} 
          isActive={pathname === navItem.href} 
        />
      ))}
    </div>
  );
};

const MobileNavItem = ({ label, children, href, isActive, subLabel }: NavItemWithActive) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Link 
          href={children ? '#' : (href ?? '#')} 
          onClick={children ? () => setIsOpen(!isOpen) : undefined}
          className={`text-base font-medium ${isActive ? 'text-primary' : ''}`}
        >
          {label}
        </Link>
        {children && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(!isOpen)}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </div>

      {isOpen && children && (
        <div className="ml-4 border-l pl-4 space-y-3">
          {children.map((child) => (
            <Link 
              key={child.label} 
              href={child.href ?? '#'} 
              className="block py-2 text-sm"
            >
              <div className="font-medium">{child.label}</div>
              {child.subLabel && (
                <div className="text-xs text-muted-foreground">{child.subLabel}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
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