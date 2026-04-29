"use client";

import { useEffect, useState } from 'react';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { ShoppingBag, PlusCircle, UserCircle, LogOut, Menu, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
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
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('Navbar');
  const [user, setUser] = useState<User | null>(null);
  const [dbProfile, setDbProfile] = useState<{ firstName: string; lastName: string; photoUrl?: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const res = await fetch(`${API_URL}/users/${currentUser.uid}`);
          if (res.ok) {
            const text = await res.text();
            if (text) {
              const data = JSON.parse(text);
              setDbProfile(data);
            }
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
        <div className="flex items-center gap-2 md:gap-6">
          <div className="md:hidden flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="focus-visible:outline-none focus:outline-none flex items-center justify-center p-2 -ml-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 mt-2">
                <DropdownMenuItem className="cursor-pointer py-2.5">
                  <Link href="/" className="w-full h-full">
                    {t('marketFeed')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-2.5">
                  <Link href="/browse" className="w-full h-full">
                    {t('browse')}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Link href="/" className="flex items-center">
            <span className="hidden sm:inline-block text-2xl font-bold text-blue-600 tracking-tight">MBS</span>
            <span className="text-3xl text-foreground sm:ml-2 font-caveat origin-bottom -rotate-2">
              Talad <span className="hidden sm:inline">Nut</span>
            </span>
          </Link>
          <div className="hidden md:flex gap-4 ml-6 items-center">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t('marketFeed')}
            </Link>
            <Link href="/browse" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t('browse')}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Switcher */}
          <Link href={pathname} locale={locale === 'en' ? 'th' : 'en'} className="flex items-center justify-center h-8 w-8 rounded-full border bg-background hover:bg-muted transition-colors" title={locale === 'en' ? 'Switch to Thai' : 'Switch to English'}>
            <span className="text-lg leading-none" role="img" aria-label="language flag">
              {locale === 'en' ? '🇺🇸' : '🇹🇭'}
            </span>
          </Link>

          {user ? (
            <>
              <Link 
                href="/post" 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-blue-600 text-white shadow hover:bg-blue-700 h-8 px-3 hidden sm:flex"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('postItem')}
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
                        <p className="text-sm font-semibold leading-none text-foreground">{t('myAccount')}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer py-2.5">
                    <Link href="/my-listings" className="w-full h-full">
                      {t('myListings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer py-2.5">
                    <Link href="/my-account" className="w-full h-full">
                      {t('myAccount')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer py-2.5 text-destructive focus:bg-destructive/15 focus:text-destructive" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-medium">{t('logOut')}</span>
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
                {t('login')}
              </Link>
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-blue-600 text-white shadow hover:bg-blue-700 h-8 px-3"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
