import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/ChatbotWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bob's Steaks & Hoagies | Philadelphia's Finest Cheesesteaks",
  description:
    "100% grass-fed, always made to order. Philadelphia's best Philly cheesesteaks and hoagies at 1949 W Norris St. Order online or call our AI assistant 24/7.",
  keywords:
    "Philly cheesesteak, hoagies, Philadelphia, Bob's Steaks, grass-fed beef, cheesesteak near me",
  openGraph: {
    title: "Bob's Steaks & Hoagies",
    description: "Philadelphia's finest 100% grass-fed cheesesteaks & hoagies",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "Bob's Steaks & Hoagies - Philadelphia Cheesesteak",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ChatbotWidget />
      </body>
    </html>
  );
}
