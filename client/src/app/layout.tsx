import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlavourCompass - Discover Amazing African Cuisine Near You",
  description:
    "AI-powered platform connecting food lovers with authentic African dishes and trusted vendors. Find jollof rice, amala, egusi, and more in your area.",
  keywords: "African food, jollof rice, amala, egusi, food delivery, AI food discovery, African cuisine, food vendors",
  openGraph: {
    title: "FlavourCompass - Discover Amazing African Cuisine",
    description: "AI-powered platform for discovering authentic African dishes near you",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        {children}
      </body>
    </html>
  );
}
