import { ProductEntry, BidActivity } from './types';

// Deterministic base timestamp to avoid SSR/prerender divergence
const BASE_TIME = 1740000000000;

// Realistic initial products with timestamps for tie-breaker testing
export const INITIAL_PRODUCTS: ProductEntry[] = [
  {
    id: 'prod-1',
    name: 'Cursor AI',
    tagline: 'The AI-first Code Editor built for hyper-productive engineers',
    url: 'https://cursor.com',
    logo: '⚡',
    category: 'DevTools',
    allTimeSpend: 14850,
    todaySpend: 650,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 30, // 30 days ago
    rankDelta: 0,
    clicks: 14200,
    description: 'An AI-powered fork of VS Code with seamless autocomplete, instant agent chat, and multi-file code editing.',
    verified: true,
  },
  {
    id: 'prod-2',
    name: 'Lovable Dev',
    tagline: 'Turn ideas into production full-stack web applications in seconds',
    url: 'https://lovable.dev',
    logo: '❤️',
    category: 'AI & ML',
    allTimeSpend: 11420,
    todaySpend: 820,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 25,
    rankDelta: 1,
    clicks: 11840,
    description: 'The world’s most autonomous full-stack software engineer. Build web apps from plain English prompts.',
    verified: true,
  },
  {
    id: 'prod-3',
    name: 'v0 by Vercel',
    tagline: 'Generative UI system powered by AI and React Tailwind',
    url: 'https://v0.dev',
    logo: '▲',
    category: 'DevTools',
    allTimeSpend: 9800,
    todaySpend: 420,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 20,
    rankDelta: -1,
    clicks: 9540,
    description: 'Create frontend user interfaces with simple prompts. Generates copy-pasteable shadcn/ui and Tailwind components.',
    verified: true,
  },
  {
    id: 'prod-4',
    name: 'Bolt.new',
    tagline: 'Prompt, build, and deploy full-stack browser web applications',
    url: 'https://bolt.new',
    logo: '⚡',
    category: 'DevTools',
    allTimeSpend: 7450,
    todaySpend: 310,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 15,
    rankDelta: 2,
    clicks: 7200,
    description: 'In-browser AI IDE running WebContainers. Create Node.js, Next.js, and Vite apps right inside your browser tab.',
    verified: true,
  },
  {
    id: 'prod-5',
    name: 'Linear App',
    tagline: 'The issue tracker built for high-performance software teams',
    url: 'https://linear.app',
    logo: '◈',
    category: 'Productivity',
    allTimeSpend: 5900,
    todaySpend: 180,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 18,
    rankDelta: 0,
    clicks: 5890,
    description: 'Linear streamlines software projects, sprints, tasks, and bug tracking with lightning-fast keyboard shortcuts.',
    verified: true,
  },
  {
    id: 'prod-6',
    name: 'Midjourney v7',
    tagline: 'Next-generation photorealistic image and texture synthesis',
    url: 'https://midjourney.com',
    logo: '⛵',
    category: 'Design',
    allTimeSpend: 4620,
    todaySpend: 120,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 12,
    rankDelta: -1,
    clicks: 4320,
    description: 'Independent research lab exploring new mediums of thought and expanding the imaginative powers of the human species.',
    verified: true,
  },
  {
    id: 'prod-7',
    name: 'Supabase Cloud',
    tagline: 'The open-source Firebase alternative with Postgres & Vector',
    url: 'https://supabase.com',
    logo: '⚡',
    category: 'DevTools',
    allTimeSpend: 3850,
    todaySpend: 95,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 10,
    rankDelta: 1,
    clicks: 3950,
    description: 'Build in a weekend, scale to millions. Postgres database, Authentication, Instant APIs, Edge Functions and Vector.',
    verified: true,
  },
  {
    id: 'prod-8',
    name: 'Raycast Pro',
    tagline: 'Supercharged Mac and Windows launcher with AI commands',
    url: 'https://raycast.com',
    logo: '🔴',
    category: 'Productivity',
    allTimeSpend: 2980,
    todaySpend: 60,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 8,
    rankDelta: 0,
    clicks: 3100,
    description: 'Raycast is a blazingly fast, totally extendable launcher that lets you complete tasks, calculate, and trigger AI in seconds.',
    verified: true,
  },
  {
    id: 'prod-9',
    name: 'Perplexity AI',
    tagline: 'Where knowledge begins: interactive conversational search engine',
    url: 'https://perplexity.ai',
    logo: '♾️',
    category: 'AI & ML',
    allTimeSpend: 2450,
    todaySpend: 210,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 6,
    rankDelta: 3,
    clicks: 2840,
    description: 'AI-search engine that gives accurate, grounded answers with live citations and deep research mode.',
    verified: true,
  },
  {
    id: 'prod-10',
    name: 'Resend',
    tagline: 'Email for developers. Modern SDKs, reliable deliverability',
    url: 'https://resend.com',
    logo: '✉️',
    category: 'SaaS',
    allTimeSpend: 1890,
    todaySpend: 45,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 5,
    rankDelta: 0,
    clicks: 1980,
    description: 'The best way to reach humans instead of spam folders. Deliver transactional and marketing emails with React components.',
    verified: true,
  },
  {
    id: 'prod-11',
    name: 'Phantom Wallet',
    tagline: 'The friendly crypto wallet for Solana, Bitcoin, and Ethereum',
    url: 'https://phantom.app',
    logo: '👻',
    category: 'Web3',
    allTimeSpend: 1420,
    todaySpend: 20,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 4,
    rankDelta: -1,
    clicks: 1650,
    description: 'A crypto wallet for DeFi & NFTs. Safe, simple, and intuitive asset management across chains.',
    verified: true,
  },
  {
    id: 'prod-12',
    name: 'Screen Studio',
    tagline: 'Create beautiful, cinematic screen recordings automatically',
    url: 'https://screen.studio',
    logo: '🎥',
    category: 'Design',
    allTimeSpend: 1100,
    todaySpend: 15,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 3,
    rankDelta: 0,
    clicks: 1240,
    description: 'High-impact product demos and promotional clips with automatic zoom, cursor smoothing, and motion blur.',
    verified: true,
  }
];

export const INITIAL_ACTIVITIES: BidActivity[] = [
  {
    id: 'act-1',
    productId: 'prod-2',
    productName: 'Lovable Dev',
    amount: 820,
    targetRank: 2,
    previousRank: 3,
    timestamp: BASE_TIME - 1000 * 60 * 12,
    isBump: true,
  },
  {
    id: 'act-2',
    productId: 'prod-4',
    productName: 'Bolt.new',
    amount: 310,
    targetRank: 4,
    previousRank: 6,
    timestamp: BASE_TIME - 1000 * 60 * 45,
    isBump: true,
  },
  {
    id: 'act-3',
    productId: 'prod-9',
    productName: 'Perplexity AI',
    amount: 210,
    targetRank: 9,
    previousRank: 12,
    timestamp: BASE_TIME - 1000 * 60 * 110,
    isBump: true,
  },
  {
    id: 'act-4',
    productId: 'prod-1',
    productName: 'Cursor AI',
    amount: 650,
    targetRank: 1,
    previousRank: 1,
    timestamp: BASE_TIME - 1000 * 60 * 180,
    isBump: false,
  }
];



export function sortLeaderboard(products: ProductEntry[], board: 'all-time' | 'daily'): ProductEntry[] {
  return [...products].sort((a, b) => {
    const valA = board === 'all-time' ? a.allTimeSpend : a.todaySpend;
    const valB = board === 'all-time' ? b.allTimeSpend : b.todaySpend;
    
    if (valB !== valA) {
      return valB - valA; // highest spend first
    }
    // Tie-breaker: older listing wins (smaller createdAt timestamp = older)
    return a.createdAt - b.createdAt;
  });
}

export function calculateRequiredBid({
  targetRank,
  sortedProducts,
  board,
  existingProductUrl,
}: {
  targetRank: number;
  sortedProducts: ProductEntry[];
  board: 'all-time' | 'daily';
  existingProductUrl?: string;
}): {
  targetSpendRequired: number;
  existingSpend: number;
  netPayable: number;
  currentHolder?: ProductEntry;
  isExistingOwner: boolean;
  minDeltaToBeat: number;
} {
  const currentLeader = sortedProducts[0];
  const targetIndex = targetRank - 1;
  const currentHolder = sortedProducts[targetIndex];

  let targetSpendRequired = 5;

  if (targetRank === 1) {
    if (currentLeader) {
      const topSpend = board === 'all-time' ? currentLeader.allTimeSpend : currentLeader.todaySpend;
      targetSpendRequired = topSpend + 5;
    } else {
      targetSpendRequired = 5;
    }
  } else {
    if (currentHolder) {
      const holderSpend = board === 'all-time' ? currentHolder.allTimeSpend : currentHolder.todaySpend;
      targetSpendRequired = holderSpend + 1;
    } else {
      const lastHolder = sortedProducts[sortedProducts.length - 1];
      targetSpendRequired = lastHolder
        ? (board === 'all-time' ? Math.max(5, lastHolder.allTimeSpend) : Math.max(5, lastHolder.todaySpend))
        : 5;
    }
  }

  let existingSpend = 0;
  let isExistingOwner = false;
  if (existingProductUrl) {
    const cleanUrl = existingProductUrl.trim().toLowerCase().replace(/\/$/, '');
    const found = sortedProducts.find(
      (p) => p.url.trim().toLowerCase().replace(/\/$/, '') === cleanUrl
    );
    if (found) {
      isExistingOwner = true;
      existingSpend = board === 'all-time' ? found.allTimeSpend : found.todaySpend;
    }
  }

  const netPayable = Math.max(targetRank === 1 ? 5 : 1, targetSpendRequired - existingSpend);

  return {
    targetSpendRequired,
    existingSpend,
    netPayable,
    currentHolder,
    isExistingOwner,
    minDeltaToBeat: targetRank === 1 ? 5 : 1,
  };
}
