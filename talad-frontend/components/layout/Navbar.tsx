"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, PlusCircle, UserCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_URL } from '@/lib/api-config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dbProfile, setDbProfile] = useState<{ firstName: string; lastName: string; photoUrl?: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const res = await fetch(`${API_URL}/users/${currentUser.uid}`);
          if (res.ok) {
            const data = await res.json();
            setDbProfile(data);
          }
        } catch (err) {
          console.error("Failed to fetch Postgres profile", err);
        }
      } else {
        setDbProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const getInitials = () => {
    if (dbProfile?.firstName && dbProfile?.lastName) {
      return (dbProfile.firstName[0] + dbProfile.lastName[0]).toUpperCase();
    }
    if (!user) return 'MB';
    if (user.displayName) {
      const parts = user.displayName.split(' ');
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return user.displayName.slice(0, 2).toUpperCase();
    }
    if (user.email) {
      const namePart = user.email.split('@')[0];
      const parts = namePart.split('.');
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return namePart.slice(0, 2).toUpperCase();
    }
    return 'MB';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center px-4 justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600 tracking-tight">MBS</span>
            <span className="text-3xl text-foreground ml-2 font-caveat origin-bottom -rotate-2">Talad Nut</span>
          </Link>
          <div className="hidden md:flex gap-4 ml-6 items-center">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Market Feed
            </Link>
            <Link href="/browse" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link 
                href="/post" 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-blue-600 text-white shadow hover:bg-blue-700 h-8 px-3 hidden sm:flex"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Post Item
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full focus-visible:outline-none focus:outline-none">
                  <Avatar className="h-10 w-10 border shadow-sm transition hover:opacity-80">
                    <AvatarImage src={dbProfile?.photoUrl || user.photoURL || undefined} alt={user.displayName || user.email || "User"} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold tracking-wider">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal py-3">
                      <div className="flex flex-col space-y-1.5">
                        <p className="text-sm font-semibold leading-none text-foreground">My Account</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer py-2.5">
                    <Link href="/my-listings" className="w-full h-full">
                      My Listings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer py-2.5">
                    <Link href="/my-account" className="w-full h-full">
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer py-2.5 text-destructive focus:bg-destructive/15 focus:text-destructive" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-medium">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-blue-600 text-white shadow hover:bg-blue-700 h-8 px-3"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
