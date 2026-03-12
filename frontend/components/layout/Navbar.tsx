/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { FuturisticButton as Button } from '@/components/ui/futuristic-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const navigationItems = [
  { name: 'Developers', href: '/developers' },
  { name: 'Projects', href: '/projects' },
  { name: 'Opportunities', href: '/opportunities' },
];

interface NavbarProps {
  onAuthModalOpen?: (tab: 'login' | 'signup', message?: string) => void;
}

export function Navbar({ onAuthModalOpen }: NavbarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      onAuthModalOpen?.('login', 'Please login or sign up to access this page');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-transparent backdrop-blur-[6px]">
      <nav className="container mx-auto px-4 h-full">
        <div className="flex h-full items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Credynx Logo" width={48} height={48} className="w-12 h-12" />
            <span className="font-bold text-2xl hidden sm:inline">CREDYNX</span>
          </Link>

          {/* Right Side - Navigation + User Menu */}
          <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={(e) => handleNavClick(e, item.href)}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="backdrop-blur-sm bg-background/50"
                      borderColor="rgba(255, 0, 0, 1)"
                    >
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
            {isAuthenticated && (
              <>
                {/* Desktop User Menu */}
                <div className="hidden md:block">
                  <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black/90 backdrop-blur-md border border-primary/30 text-white shadow-xl shadow-black/50">
                  <DropdownMenuLabel className="text-white/60 text-xs uppercase tracking-wider">{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary/20" />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')} className="text-white hover:bg-primary/10 focus:bg-primary/10 focus:text-white cursor-pointer">
                    <User className="mr-2 h-4 w-4 text-primary" />
                    My Profile
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-primary/20" />
                      <DropdownMenuItem onClick={() => router.push('/admin/opportunities')} className="text-white hover:bg-primary/10 focus:bg-primary/10 focus:text-white cursor-pointer">
                        <Menu className="mr-2 h-4 w-4 text-primary" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-primary/20" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col gap-4 mt-8">
                    {/* User Info */}
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.email}</p>
                        <p className="text-xs text-muted-foreground">{user?.role}</p>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-col gap-2">
                      {navigationItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link key={item.href} href={item.href} onClick={(e) => {
                            handleNavClick(e, item.href);
                            setMobileMenuOpen(false);
                          }}>
                            <Button
                              size="lg"
                              variant="outline"
                              className="w-full backdrop-blur-sm bg-background/50"
                              borderColor="rgba(255, 0, 0, 1)"
                            >
                              {item.name}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Logout */}
                    <div className="pt-4 border-t mt-auto">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
