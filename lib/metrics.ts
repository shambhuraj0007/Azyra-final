/**
 * lib/metrics.ts
 *
 * Universal live stats fetcher for YouTube, X (Twitter), and Instagram.
 *
 * Routes:
 *  - YouTube  → Official Data API v3 (free 10k quota/day)
 *  - X        → Twitter v2 API (Bearer token) with oEmbed fallback
 *  - Instagram → Meta Graph API (long-lived User Access Token)
 *
 * All fetches are server-side only (called from API routes).
 */

export interface LiveStats {
  views: number;
  likes: number;
  platform: 'youtube_shorts' | 'x' | 'instagram';
  fetchedAt: number;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. YouTube — Official Data API v3
// ─────────────────────────────────────────────────────────────────────────────
async function fetchYouTube(videoId: string): Promise<LiveStats> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return { views: 0, likes: 0, platform: 'youtube_shorts', fetchedAt: Date.now(), error: 'No YOUTUBE_API_KEY' };
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`
    );
    if (!res.ok) throw new Error(`YouTube API ${res.status}`);

    const data = await res.json();
    const stats = data.items?.[0]?.statistics;

    if (!stats) {
      return { views: 0, likes: 0, platform: 'youtube_shorts', fetchedAt: Date.now(), error: 'Video not found' };
    }

    return {
      views: Number(stats.viewCount ?? 0),
      likes: Number(stats.likeCount ?? 0),
      platform: 'youtube_shorts',
      fetchedAt: Date.now(),
    };
  } catch (err: any) {
    return { views: 0, likes: 0, platform: 'youtube_shorts', fetchedAt: Date.now(), error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. X (Twitter) — v2 API with Bearer token, oEmbed existence-check fallback
//    Twitter removed public view counts from unauthenticated routes.
//    impression_count requires TWITTER_BEARER_TOKEN.
// ─────────────────────────────────────────────────────────────────────────────
async function fetchX(tweetId: string): Promise<LiveStats> {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (bearerToken) {
    try {
      const res = await fetch(
        `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics`,
        { headers: { Authorization: `Bearer ${bearerToken}` } }
      );
      if (!res.ok) throw new Error(`Twitter API ${res.status}`);
      const data = await res.json();
      const m = data.data?.public_metrics;
      return {
        views: Number(m?.impression_count ?? 0),
        likes: Number(m?.like_count ?? 0),
        platform: 'x',
        fetchedAt: Date.now(),
      };
    } catch (err: any) {
      return { views: 0, likes: 0, platform: 'x', fetchedAt: Date.now(), error: err.message };
    }
  }

  // Fallback: Completely Free Open-Source API (FxTwitter / FixTweet)
  // This proxy scrapes Twitter and returns a clean JSON with view counts, no API key needed!
  try {
    const res = await fetch(`https://api.fxtwitter.com/Twitter/status/${tweetId}`);
    if (!res.ok) throw new Error(`FxTwitter API ${res.status}`);
    const data = await res.json();
    const tweet = data.tweet;

    if (!tweet) {
      return { views: 0, likes: 0, platform: 'x', fetchedAt: Date.now(), error: 'Tweet not found via FxTwitter' };
    }

    return { 
      views: Number(tweet.views ?? 0), 
      likes: Number(tweet.likes ?? 0), 
      platform: 'x', 
      fetchedAt: Date.now() 
    };
  } catch (err: any) {
    return { views: 0, likes: 0, platform: 'x', fetchedAt: Date.now(), error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Instagram — Meta Graph API (requires a long-lived User Access Token)
//    The Instagram Basic Display API and Graph API expose like_count for Reels.
//    View count for Reels is available only via Insights (Business account).
// ─────────────────────────────────────────────────────────────────────────────
async function fetchInstagram(mediaId: string): Promise<LiveStats> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken) {
    return {
      views: 0,
      likes: 0,
      platform: 'instagram',
      fetchedAt: Date.now(),
      error: 'No INSTAGRAM_ACCESS_TOKEN — counts unavailable',
    };
  }

  try {
    const res = await fetch(
      `https://graph.instagram.com/${mediaId}?fields=like_count,comments_count,media_product_type&access_token=${accessToken}`
    );
    if (!res.ok) throw new Error(`Instagram API ${res.status}`);
    const data = await res.json();
    return {
      views: 0, // view_count requires Business Insights — not exposed in basic display
      likes: Number(data.like_count ?? 0),
      platform: 'instagram',
      fetchedAt: Date.now(),
    };
  } catch (err: any) {
    return { views: 0, likes: 0, platform: 'instagram', fetchedAt: Date.now(), error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main dispatcher
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchLiveStats(
  platform: 'youtube_shorts' | 'x' | 'instagram',
  externalId: string
): Promise<LiveStats> {
  switch (platform) {
    case 'youtube_shorts':
      return fetchYouTube(externalId);
    case 'x':
      return fetchX(externalId);
    case 'instagram':
      return fetchInstagram(externalId);
    default:
      return { views: 0, likes: 0, platform, fetchedAt: Date.now(), error: 'Unknown platform' };
  }
}
