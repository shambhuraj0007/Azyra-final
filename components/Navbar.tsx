'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Sparkles, Flame, Plus, ShieldCheck, Megaphone } from 'lucide-react';
import AzyraLogo from './AzyraLogo';

interface NavbarProps {
  onOpenBidModal: (targetRank?: number) => void;
  totalVolume: number;
  totalProducts: number;
}

export default function Navbar({ onOpenBidModal, totalVolume, totalProducts }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      {/* Top micro-bar for market health & status */}
      <div className="border-b border-zinc-900 bg-zinc-950/50 px-4 py-1 text-xs text-zinc-400">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              LIVE FINANCIAL PROTOCOL
            </span>
            <span className="hidden text-zinc-600 sm:inline">•</span>
            <span className="hidden sm:inline">
              Pure Financial Bidding Hierarchy (Zero algorithms / Zero upvotes)
            </span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <div>
              <span className="text-zinc-500">Total Capital:</span>{' '}
              <span className="font-semibold text-amber-400">${totalVolume.toLocaleString()}</span>
            </div>
            <div className="hidden md:inline">
              <span className="text-zinc-500">Active Listings:</span>{' '}
              <span className="font-semibold text-zinc-200">{totalProducts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <AzyraLogo size="md" />
            <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-bold text-purple-400 border border-purple-500/20 hidden sm:inline">
              Leaderboard
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/"
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors ${
                pathname === '/'
                  ? 'bg-zinc-800 text-amber-400 font-semibold shadow-inner'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Link>

            <Link
              href="/campaigns"
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors ${
                pathname === '/campaigns'
                  ? 'bg-zinc-800 text-amber-400 font-semibold shadow-inner'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              <Megaphone className="h-4 w-4 text-emerald-400" />
              Creator Campaigns
              <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                New
              </span>
            </Link>

            <a
              href="#how-it-works"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
            >
              <ShieldCheck className="h-4 w-4 text-amber-400/80" />
              How It Works
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/campaigns"
            className="md:hidden flex items-center gap-1.5 text-xs text-zinc-300 bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800"
          >
            <Megaphone className="h-3.5 w-3.5 text-emerald-400" />
            Campaigns
          </Link>

          <button
            onClick={() => onOpenBidModal(1)}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 px-4 py-2 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] hover:shadow-amber-500/30 active:scale-95"
          >
            <Sparkles className="h-4 w-4 text-zinc-950" />
            <span>Outbid & Claim Rank</span>
          </button>
        </div>
      </div>
    </header>
  );
}
