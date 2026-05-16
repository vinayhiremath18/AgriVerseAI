import type { Metadata, Viewport } from "next";
import { Inter, Orbitron, Space_Grotesk } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgriVerse AI — The Future of Smart Agriculture",
  description:
    "AgriVerse AI harnesses artificial intelligence, robotics, and real-time analytics to revolutionize modern farming. AI Pest Doctor, Market Intelligence, Smart Crop Shop, and more.",
  keywords: [
    "AgriVerse AI",
    "Smart Agriculture",
    "AI Farming",
    "Crop Disease Detection",
    "Precision Agriculture",
    "Farm Robotics",
  ],
  openGraph: {
    title: "AgriVerse AI — The Future of Smart Agriculture",
    description:
      "Revolutionize farming with AI-powered pest detection, market intelligence, and autonomous robots.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#020d04",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col noise-overlay">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
