import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import "../globals.css";
import { Navbar } from "@/components/layout/Navbar";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MBS Talad Nut | Office Marketplace",
  description: "The internal marketplace for MBS employees to buy, sell, and trade items easily.",
  openGraph: {
    title: "MBS Talad Nut | Office Marketplace",
    description: "The internal marketplace for MBS employees to buy, sell, and trade items easily.",
    url: "https://mbs-talad-nut.vercel.app",
    siteName: "MBS Talad Nut",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MBS Talad Nut - Office Marketplace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MBS Talad Nut | Office Marketplace",
    description: "The internal marketplace for MBS employees to buy, sell, and trade items easily.",
    images: ["/og-image.png"],
  },
};


export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-zinc-950">
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
