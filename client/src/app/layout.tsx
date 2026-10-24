import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Foodie — Wetin you wan chop?",
  description:
    "Smoky party jollof, proper egusi, and your next suya craving. Discover Nigerian food and local kitchens that feel like home with Foodie.",
  keywords:
    "Foodie, Nigerian food, jollof rice, suya, ofada, egusi, small chops, local kitchens, food discovery",
  openGraph: {
    title: "Foodie — Wetin you wan chop?",
    description:
      "Our food. Our people. Find your next favourite meal with Foodie.",
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
        <QueryProvider>
          <Toaster />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
