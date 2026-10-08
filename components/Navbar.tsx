'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Sparkles, ShieldCheck, Megaphone, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import AzyraLogo from './AzyraLogo';
import { useCampaigns } from '../lib/CampaignContext';

interface NavbarProps {
  onOpenBidModal?: (targetRank?: number) => void;
  totalVolume?: number;
  totalProducts?: number;
}

export default function Navbar({ onOpenBidModal, totalVolume, totalProducts }: NavbarProps) {
  const pathname = usePathname();
  const { currentUser, openSetupModal } = useCampaigns();

  return (
    <header className="sticky top-0 z-40 border-b border-borderMuted bg-surface/85 backdrop-blur-xl">
      {/* Main navigation bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex flex-col items-start">
            <AzyraLogo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
            <Link
              href="/"
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 font-heading transition-colors ${pathname === '/'
                  ? 'bg-surfaceElevated text-limeAccent font-bold border border-borderMuted shadow-sm'
                  : 'text-textMuted hover:bg-surfaceElevated hover:text-textMain'
                }`}
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Link>

            <Link
              href="/campaigns"
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 font-heading transition-colors ${pathname.startsWith('/campaigns')
                  ? 'bg-surfaceElevated text-limeAccent font-bold border border-borderMuted shadow-sm'
                  : 'text-textMuted hover:bg-surfaceElevated hover:text-textMain'
                }`}
            >
              <Megaphone className="h-4 w-4 text-emeraldAccent" />
              Creator Campaigns
              <span className="rounded-md bg-emeraldAccent/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emeraldAccent border border-emeraldAccent/20">
                Earn
              </span>
            </Link>

            <Link
              href="/profile"
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 font-heading transition-colors relative ${pathname === '/profile'
                  ? 'bg-surfaceElevated text-limeAccent font-bold border border-borderMuted shadow-sm'
                  : 'text-textMuted hover:bg-surfaceElevated hover:text-textMain'
                }`}
            >
              <User className="h-4 w-4 text-textMain" />
              Profile
              {!currentUser?.isProfileSetup && (
                <span className="h-2 w-2 rounded-full bg-limeAccent ring-2 ring-surface animate-pulse" />
              )}
            </Link>

            <Link
              href="/#how-it-works"
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-textMuted font-heading transition-colors hover:bg-surfaceElevated hover:text-textMain"
            >
              <ShieldCheck className="h-4 w-4 text-limeAccent/80" />
              How It Works
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* User profile / login pill */}
          {currentUser?.isLoggedIn ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-xl bg-surfaceElevated border border-borderMuted hover:border-limeAccent/50 px-2.5 sm:px-3 py-1.5 text-xs transition"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface text-xs border border-borderMuted overflow-hidden">
                {currentUser.avatar?.startsWith('http') ? (
                  <img src={currentUser.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  currentUser.avatar || '🎬'
                )}
              </span>
              <span className="hidden sm:inline font-mono font-bold text-textMain">
                {currentUser.handle || currentUser.name || 'User'}
              </span>
              {!currentUser.isProfileSetup && currentUser.role !== 'creator' && (
                <span className="text-[10px] bg-limeAccent/20 text-limeAccent px-1.5 py-0.2 rounded font-mono">
                  Apply
                </span>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl bg-surfaceElevated border border-borderMuted hover:border-limeAccent/50 px-3 py-1.5 text-xs font-heading text-textMain transition hover:text-limeAccent"
            >
              <User className="h-3.5 w-3.5 text-limeAccent" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Outbid CTA */}
          {onOpenBidModal ? (
            <button
              onClick={() => onOpenBidModal(1)}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-limeAccent px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-heading font-bold text-[#0B0F10] shadow-md shadow-limeAccent/20 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4 text-[#0B0F10]" />
              <span className="hidden sm:inline">Outbid & Claim Rank</span>
              <span className="sm:hidden">Outbid</span>
            </button>
          ) : (
            <Link
              href="/?claim=1"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-limeAccent px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-heading font-bold text-[#0B0F10] shadow-md shadow-limeAccent/20 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4 text-[#0B0F10]" />
              <span className="hidden sm:inline">Outbid & Claim Rank</span>
              <span className="sm:hidden">Outbid</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
