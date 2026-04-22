import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
