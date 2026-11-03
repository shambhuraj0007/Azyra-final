import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { CampaignProvider } from "../lib/CampaignContext";
import { ThemeProvider } from "../lib/ThemeContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#08090A",
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
      { url: "/favicon-96x96.png?v=azyra5", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg?v=azyra5", type: "image/svg+xml" },
      { url: "/favicon.ico?v=azyra5" },
    ],
    shortcut: "/favicon-96x96.png?v=azyra5",
    apple: [
      { url: "/apple-touch-icon.png?v=azyra5", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest?v=azyra5",
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
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${newsreader.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png?v=azyra5" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=azyra5" />
        <link rel="shortcut icon" href="/favicon.ico?v=azyra5" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=azyra5" />
        {/* Anti-FOUC script to instantly set theme class before React mounts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('azyra_theme');
                const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
                const isLight = stored === 'light' || (stored === 'system' && prefersLight);
                if (isLight) {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-canvas text-textMain font-sans selection:bg-limeAccent selection:text-[#000000]">
        <ThemeProvider>
          <NextAuthProvider>
            <CampaignProvider>
              {children}
              <ToastContainer />
              <Suspense fallback={null}>
                <GlobalCreatorApplicationPopup />
              </Suspense>
            </CampaignProvider>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
