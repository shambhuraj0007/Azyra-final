'use client';

import React, { useState } from 'react';
import { Tweet } from 'react-tweet';
import { ExternalLink, Play, AlertCircle } from 'lucide-react';

/**
 * Error boundary to ensure third-party embed issues never crash the parent page
 */
class SafeEmbedBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('Embed rendering error caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * YouTube Embed Component
 * Supports standard watch URLs, short youtu.be links, and YouTube Shorts
 */
export function YouTubeEmbed({ url }: { url: string }) {
  const getYouTubeId = (link: string) => {
    if (!link) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = link.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeId(url);

  if (!videoId) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-limeAccent transition group text-xs"
      >
        <span className="text-textMuted group-hover:text-textMain truncate">{url}</span>
        <ExternalLink className="h-3.5 w-3.5 text-limeAccent shrink-0 ml-2" />
      </a>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shadow-lg">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title="YouTube video player"
        className="absolute top-0 left-0 w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

/**
 * X / Twitter Post Embed Component via official react-tweet
 */
export function XPostEmbed({ url }: { url: string }) {
  const [hasError, setHasError] = useState(false);

  // Extract tweet ID from URL (e.g. twitter.com/user/status/123456789 or x.com/user/status/123456789)
  const extractTweetId = (link: string) => {
    if (!link) return null;
    const match = link.match(/status\/(\d+)/);
    return match ? match[1] : null;
  };

  const tweetId = extractTweetId(url);

  const fallbackCard = (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-neutral-900/90 border border-white/10 p-3.5 rounded-xl hover:border-limeAccent transition group shadow-sm"
    >
      <div className="w-9 h-9 rounded-lg bg-black border border-white/10 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-heading font-bold text-white group-hover:text-limeAccent truncate">
          View Post on 𝕏 (Twitter)
        </h4>
        <p className="text-[11px] font-mono text-textMuted truncate mt-0.5">{url}</p>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-textMuted group-hover:text-limeAccent shrink-0" />
    </a>
  );

  if (!tweetId || hasError) {
    return fallbackCard;
  }

  return (
    <SafeEmbedBoundary fallback={fallbackCard}>
      <div
        data-theme="dark"
        className="my-2 [&>div]:!max-w-none [&>div]:!bg-neutral-900 [&>div]:!border [&>div]:!border-white/10 [&>div]:!rounded-xl overflow-hidden"
      >
        <Tweet
          id={tweetId}
          onError={() => setHasError(true)}
          components={{ TweetNotFound: () => fallbackCard }}
        />
      </div>
    </SafeEmbedBoundary>
  );
}

/**
 * Instagram Rich Card Component
 */
export function InstagramCard({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-neutral-900/90 border border-white/10 p-3.5 rounded-xl hover:border-limeAccent transition group shadow-sm"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-heading font-bold text-white group-hover:text-limeAccent truncate">
          View Instagram Post / Reel
        </h4>
        <p className="text-[11px] font-mono text-textMuted truncate mt-0.5">{url}</p>
      </div>
      <span className="text-xs text-textMuted group-hover:text-limeAccent font-mono">↗</span>
    </a>
  );
}

/**
 * TikTok Rich Card Component
 */
export function TikTokCard({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-neutral-900/90 border border-white/10 p-3.5 rounded-xl hover:border-limeAccent transition group shadow-sm"
    >
      <div className="w-10 h-10 rounded-xl bg-black border border-white/20 flex items-center justify-center shrink-0 shadow-md">
        <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.3 6.3 0 0 0 1.87-4.49V8.65a8.28 8.28 0 0 0 4.8 1.53V6.73a4.85 4.85 0 0 1-.9-.04z"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-heading font-bold text-white group-hover:text-limeAccent truncate">
          View TikTok Video
        </h4>
        <p className="text-[11px] font-mono text-textMuted truncate mt-0.5">{url}</p>
      </div>
      <span className="text-xs text-textMuted group-hover:text-limeAccent font-mono">↗</span>
    </a>
  );
}

/**
 * Universal Social Post Renderer
 * Inspects submitted URL, detects platform, and renders the native embed/card
 */
export function SocialPostRenderer({
  url,
  compact = false,
}: {
  url: string;
  compact?: boolean;
}) {
  if (!url) {
    return <span className="text-xs text-textMuted italic">No URL provided</span>;
  }

  const clean = url.toLowerCase();

  if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
    if (compact) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-mono transition"
        >
          <Play className="h-3 w-3 fill-red-400" />
          <span>YouTube Video</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>
      );
    }
    return <YouTubeEmbed url={url} />;
  }

  if (clean.includes('twitter.com') || clean.includes('x.com')) {
    if (compact) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-textMain hover:border-limeAccent text-xs font-mono transition"
        >
          <span>𝕏 Post</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>
      );
    }
    return <XPostEmbed url={url} />;
  }

  if (clean.includes('instagram.com')) {
    if (compact) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/20 text-xs font-mono transition"
        >
          <span>Instagram Reel</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>
      );
    }
    return <InstagramCard url={url} />;
  }

  if (clean.includes('tiktok.com')) {
    if (compact) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 text-xs font-mono transition"
        >
          <span>TikTok Video</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>
      );
    }
    return <TikTokCard url={url} />;
  }

  // Fallback for general links (blog, website, etc.)
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-limeAccent transition group text-xs font-mono"
    >
      <span className="text-textMuted group-hover:text-textMain truncate">{url}</span>
      <ExternalLink className="h-3.5 w-3.5 text-limeAccent shrink-0 ml-2" />
    </a>
  );
}

export default SocialPostRenderer;
