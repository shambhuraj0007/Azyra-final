import { ProductEntry, BidActivity } from './types';

// Deterministic base timestamp to avoid SSR/prerender divergence
const BASE_TIME = 1740000000000;

// Helper to generate epoch timestamps on today's calendar day
const getTodayTimestamp = (minutesAgo: number = 0) => {
  return typeof Date !== 'undefined' ? Date.now() - minutesAgo * 60 * 1000 : BASE_TIME;
};

// Realistic initial products with timestamps for tie-breaker testing and payment date tracking
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
    lastPaymentDate: getTodayTimestamp(45),
    payments: [
      { amount: 14200, timestamp: BASE_TIME - 1000 * 60 * 60 * 24 * 5 },
      { amount: 650, timestamp: getTodayTimestamp(45) },
    ],
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
    lastPaymentDate: getTodayTimestamp(15),
    payments: [
      { amount: 10600, timestamp: BASE_TIME - 1000 * 60 * 60 * 24 * 3 },
      { amount: 820, timestamp: getTodayTimestamp(15) },
    ],
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
    lastPaymentDate: getTodayTimestamp(90),
    payments: [
      { amount: 9380, timestamp: BASE_TIME - 1000 * 60 * 60 * 24 * 8 },
      { amount: 420, timestamp: getTodayTimestamp(90) },
    ],
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
    lastPaymentDate: getTodayTimestamp(120),
    payments: [
      { amount: 7140, timestamp: BASE_TIME - 1000 * 60 * 60 * 24 * 4 },
      { amount: 310, timestamp: getTodayTimestamp(120) },
    ],
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
    lastPaymentDate: getTodayTimestamp(180),
    payments: [
      { amount: 5720, timestamp: BASE_TIME - 1000 * 60 * 60 * 24 * 2 },
      { amount: 180, timestamp: getTodayTimestamp(180) },
    ],
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
    todaySpend: 0,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 12,
    lastPaymentDate: BASE_TIME - 1000 * 60 * 60 * 24 * 2,
    payments: [
      { amount: 4620, timestamp: BASE_TIME - 1000 * 60 * 60 * 24 * 2 },
    ],
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
    todaySpend: 0,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 10,
    lastPaymentDate: BASE_TIME - 1000 * 60 * 60 * 24 * 3,
    payments: [
      { amount: 3850, timestamp: BASE_TIME - 1000 * 60 * 60 * 24 * 3 },
    ],
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
    todaySpend: 0,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 8,
    lastPaymentDate: BASE_TIME - 1000 * 60 * 60 * 24 * 4,
    payments: [
      { amount: 2980, timestamp: BASE_TIME - 1000 * 60 * 60 * 24 * 4 },
    ],
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
    lastPaymentDate: getTodayTimestamp(60),
    payments: [
      { amount: 2240, timestamp: BASE_TIME - 1000 * 60 * 60 * 24 * 6 },
      { amount: 210, timestamp: getTodayTimestamp(60) },
    ],
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
    todaySpend: 0,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 5,
    lastPaymentDate: BASE_TIME - 1000 * 60 * 60 * 24 * 5,
    payments: [
      { amount: 1890, timestamp: BASE_TIME - 1000 * 60 * 60 * 24 * 5 },
    ],
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
    todaySpend: 0,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 4,
    lastPaymentDate: BASE_TIME - 1000 * 60 * 60 * 24 * 4,
    payments: [
      { amount: 1420, timestamp: BASE_TIME - 1000 * 60 * 60 * 24 * 4 },
    ],
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
    todaySpend: 0,
    createdAt: BASE_TIME - 1000 * 60 * 60 * 24 * 3,
    lastPaymentDate: BASE_TIME - 1000 * 60 * 60 * 24 * 3,
    payments: [
      { amount: 1100, timestamp: BASE_TIME - 1000 * 60 * 60 * 24 * 3 },
    ],
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
    timestamp: getTodayTimestamp(15),
    isBump: true,
  },
  {
    id: 'act-2',
    productId: 'prod-4',
    productName: 'Bolt.new',
    amount: 310,
    targetRank: 4,
    previousRank: 6,
    timestamp: getTodayTimestamp(45),
    isBump: true,
  },
  {
    id: 'act-3',
    productId: 'prod-9',
    productName: 'Perplexity AI',
    amount: 210,
    targetRank: 9,
    previousRank: 12,
    timestamp: getTodayTimestamp(60),
    isBump: true,
  },
  {
    id: 'act-4',
    productId: 'prod-1',
    productName: 'Cursor AI',
    amount: 650,
    targetRank: 1,
    previousRank: 1,
    timestamp: getTodayTimestamp(90),
    isBump: false,
  }
];



/**
 * Checks if a given epoch timestamp occurred on today's date (UTC calendar day).
 */
export function isPaymentToday(timestamp?: number): boolean {
  if (!timestamp) return false;
  const paymentDate = new Date(timestamp);
  const now = new Date();
  return (
    paymentDate.getUTCFullYear() === now.getUTCFullYear() &&
    paymentDate.getUTCMonth() === now.getUTCMonth() &&
    paymentDate.getUTCDate() === now.getUTCDate()
  );
}

/**
 * Calculates today's total payment spend for a product by checking the date of each payment.
 * If a payment was made on today's date, it counts toward today's payment; otherwise it is excluded.
 */
export function calculateProductTodaySpend(product: ProductEntry): number {
  if (!product) return 0;
  if (Array.isArray(product.payments) && product.payments.length > 0) {
    const todayPayments = product.payments.filter((p) => isPaymentToday(p.timestamp));
    if (todayPayments.length > 0) {
      return todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    }
  }
  if (product.lastPaymentDate) {
    return isPaymentToday(product.lastPaymentDate) ? (product.todaySpend || 0) : 0;
  }
  return product.todaySpend || 0;
}

/**
 * Sorts products strictly by financial hierarchy:
 * - All-time board: uses total paid amount (allTimeSpend) to rank listings.
 * - Daily board: uses the date of payment to track today's payment (todaySpend).
 * - Tie-breaker: earlier creation timestamp wins.
 */
export function sortLeaderboard(products: ProductEntry[], board: 'all-time' | 'daily'): ProductEntry[] {
  return [...products].sort((a, b) => {
    const valA = board === 'all-time' ? (a.allTimeSpend || 0) : calculateProductTodaySpend(a);
    const valB = board === 'all-time' ? (b.allTimeSpend || 0) : calculateProductTodaySpend(b);
    
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

  let targetSpendRequired = 1;

  if (targetRank === 1) {
    if (currentLeader) {
      const topSpend = board === 'all-time' ? currentLeader.allTimeSpend : calculateProductTodaySpend(currentLeader);
      // To overtake Rank #1, you need exactly $1 more than the current leader
      targetSpendRequired = topSpend + 1;
    } else {
      // Empty board: $1 secures Rank #1
      targetSpendRequired = 1;
    }
  } else if (currentHolder) {
    // To overtake any occupied spot, you need exactly $1 more than the occupant
    const holderSpend = board === 'all-time' ? currentHolder.allTimeSpend : calculateProductTodaySpend(currentHolder);
    targetSpendRequired = holderSpend + 1;
  } else {
    // If targeting an open/bottom position beyond current listings, entry is just $1
    targetSpendRequired = 1;
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
      existingSpend = board === 'all-time' ? found.allTimeSpend : calculateProductTodaySpend(found);
    }
  }

  // Under the Bump Protocol rule: pay only the incremental delta (minimum $1)
  const netPayable = Math.max(1, targetSpendRequired - existingSpend);

  return {
    targetSpendRequired,
    existingSpend,
    netPayable,
    currentHolder,
    isExistingOwner,
    minDeltaToBeat: 1,
  };
}

export function extractDomain(rawUrl: string): string {
  if (!rawUrl) return '';
  let cleaned = rawUrl.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, '');
  cleaned = cleaned.replace(/^www\./, '');
  cleaned = cleaned.split('/')[0].split('?')[0].split('#')[0];
  return cleaned;
}

export function getFaviconUrl(domainOrUrl: string, size: number = 128): string {
  const domain = extractDomain(domainOrUrl);
  if (!domain || !domain.includes('.')) return '';
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

export function inferStartupName(rawUrl: string): string {
  const domain = extractDomain(rawUrl);
  if (!domain) return '';
  const root = domain.split('.')[0];
  if (!root) return '';
  return root.charAt(0).toUpperCase() + root.slice(1);
}

