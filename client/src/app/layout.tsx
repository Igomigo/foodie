import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Foodie - Discover Amazing African Cuisine Near You",
  description:
    "AI-powered platform connecting food lovers with authentic African dishes and trusted vendors. Find jollof rice, amala, egusi, and more in your area.",
  keywords:
    "African food, jollof rice, amala, egusi, food delivery, AI food discovery, African cuisine, food vendors",
  openGraph: {
    title: "Foodie - Discover Amazing African Cuisine",
    description:
      "AI-powered platform for discovering authentic African dishes near you",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
