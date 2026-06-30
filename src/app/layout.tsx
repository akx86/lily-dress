import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lily Dress",
  description: "Luxury dress rental catalog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* ضفنا bg-white text-zinc-900 عشان نجبر الموقع كله يكون أبيض والنص رمادي داكن */}
      <body className="min-h-full flex flex-col bg-white text-zinc-900">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
