import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { CampaignProvider } from "../lib/CampaignContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "AZYRA • Financial Leaderboard & Creator Campaign Marketplace",
  description: "Azyra is a pure financial bidding leaderboard and two-sided creator campaign marketplace for high-growth tech products.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

import { Suspense } from "react";
import { NextAuthProvider } from "../components/NextAuthProvider";
import GlobalCreatorApplicationPopup from "../components/GlobalCreatorApplicationPopup";
import ToastContainer from "../components/ToastContainer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="min-h-full flex flex-col bg-canvas text-textMain font-sans selection:bg-limeAccent selection:text-[#000000]">
        <NextAuthProvider>
          <CampaignProvider>
            {children}
            <ToastContainer />
            <Suspense fallback={null}>
              <GlobalCreatorApplicationPopup />
            </Suspense>
          </CampaignProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
