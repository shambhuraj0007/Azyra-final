import { SocialPlatform, Campaign } from './types';

export interface ParseResult {
  isValid: boolean;
  platform?: SocialPlatform;
  externalId?: string;
  normalizedUrl?: string;
  error?: string;
}

/**
 * Validates and parses video URLs across TikTok, Instagram Reels, and YouTube Shorts using regex
 */
export function parseSocialUrl(rawUrl: string): ParseResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'Please enter a video URL.' };
  }

  const url = rawUrl.trim();

  // 1. TikTok Patterns
  // https://www.tiktok.com/@creator/video/733928172918237
  // https://vm.tiktok.com/ZM8xABC/
  const tiktokRegex = /(?:tiktok\.com\/@[\w.-]+\/video\/(\d+)|vm\.tiktok\.com\/([A-Za-z0-9_-]+))/i;
  const tiktokMatch = url.match(tiktokRegex);
  if (tiktokMatch) {
    const id = tiktokMatch[1] || tiktokMatch[2];
    return {
      isValid: true,
      platform: 'tiktok',
      externalId: id,
      normalizedUrl: url,
    };
  }

  // 2. Instagram Reels
  // https://www.instagram.com/reel/C3x9z_ABC/
  // https://www.instagram.com/reels/C3x9z_ABC/
  const igRegex = /instagram\.com\/(?:reel|reels)\/([A-Za-z0-9_-]+)/i;
  const igMatch = url.match(igRegex);
  if (igMatch) {
    return {
      isValid: true,
      platform: 'instagram',
      externalId: igMatch[1],
      normalizedUrl: url,
    };
  }

  // 3. YouTube Shorts
  // https://www.youtube.com/shorts/dQw4w9WgXcQ
  // https://youtu.be/shorts/dQw4w9WgXcQ
  const ytShortsRegex = /(?:youtube\.com\/shorts\/|youtu\.be\/shorts\/)([A-Za-z0-9_-]{8,15})/i;
  const ytMatch = url.match(ytShortsRegex);
  if (ytMatch) {
    return {
      isValid: true,
      platform: 'youtube_shorts',
      externalId: ytMatch[1],
      normalizedUrl: url,
    };
  }

  // Fallback for general valid web urls that might be shorts
  if (url.includes('tiktok.com')) {
    return { isValid: true, platform: 'tiktok', externalId: `tt-${Date.now()}`, normalizedUrl: url };
  }
  if (url.includes('instagram.com')) {
    return { isValid: true, platform: 'instagram', externalId: `ig-${Date.now()}`, normalizedUrl: url };
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return { isValid: true, platform: 'youtube_shorts', externalId: `yt-${Date.now()}`, normalizedUrl: url };
  }

  return {
    isValid: false,
    error: 'Unsupported link. Must be a valid TikTok, Instagram Reel, or YouTube Short URL.',
  };
}

/**
 * Calculates earnings for a clip:
 * new_views = current_views - initial_views
 * raw_payout = (new_views / 1000) * cpm
 * clip_payout = min(raw_payout, max_payout_per_clip, campaign.remaining_budget)
 */
export function calculateClipPayout({
  initialViews,
  currentViews,
  cpmRate,
  maxPayoutPerClip,
  minViewsThreshold,
  campaignRemainingBudget,
}: {
  initialViews: number;
  currentViews: number;
  cpmRate: number;
  maxPayoutPerClip: number;
  minViewsThreshold: number;
  campaignRemainingBudget: number;
}): {
  netViews: number;
  payout: number;
  isUnlocked: boolean;
  isCapped: boolean;
} {
  const netViews = Math.max(0, currentViews - initialViews);

  if (currentViews < minViewsThreshold) {
    return {
      netViews,
      payout: 0,
      isUnlocked: false,
      isCapped: false,
    };
  }

  const rawPayout = (netViews / 1000) * cpmRate;
  const isCapped = rawPayout > maxPayoutPerClip;
  const cappedAmount = Math.min(rawPayout, maxPayoutPerClip);
  const finalPayout = Math.min(cappedAmount, Math.max(0, campaignRemainingBudget));

  return {
    netViews,
    payout: Number(finalPayout.toFixed(2)),
    isUnlocked: true,
    isCapped,
  };
}

/**
 * Formats platform names and badges
 */
export function formatPlatform(platform: SocialPlatform): {
  label: string;
  color: string;
  badgeBg: string;
} {
  switch (platform) {
    case 'tiktok':
      return { label: 'TikTok', color: 'text-pink-400', badgeBg: 'bg-pink-500/10 border-pink-500/20 text-pink-300' };
    case 'instagram':
      return { label: 'Instagram Reels', color: 'text-purple-400', badgeBg: 'bg-purple-500/10 border-purple-500/20 text-purple-300' };
    case 'youtube_shorts':
      return { label: 'YouTube Shorts', color: 'text-red-400', badgeBg: 'bg-red-500/10 border-red-500/20 text-red-300' };
  }
}
