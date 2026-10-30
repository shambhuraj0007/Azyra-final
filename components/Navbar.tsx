'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Sparkles, ShieldCheck, Megaphone, User, Menu, X, ArrowRight, Rocket } from 'lucide-react';
import AzyraLogo from './AzyraLogo';
import { useCampaigns } from '../lib/CampaignContext';

interface NavbarProps {
  onOpenBidModal?: (targetRank?: number) => void;
  totalVolume?: number;
  totalProducts?: number;
}

export default function Navbar({ onOpenBidModal, totalVolume, totalProducts }: NavbarProps) {
  const pathname = usePathname();
  const { currentUser } = useCampaigns();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-borderMuted bg-canvas/80 backdrop-blur-xl transition-all duration-200">
      {/* Main navigation bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/" className="group flex flex-col items-start" onClick={() => setMobileMenuOpen(false)}>
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
              href="/launch"
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-heading transition-colors ${pathname === '/launch'
                  ? 'bg-surfaceElevated text-limeAccent font-bold border border-borderMuted shadow-sm'
                  : 'text-textMuted hover:bg-surfaceElevated hover:text-textMain'
                }`}
            >
              <Rocket className="h-4 w-4 text-limeAccent" />
              <span>Launch Packages</span>
              <span className="rounded-md bg-limeAccent/15 px-1.5 py-0.5 text-[10px] font-mono font-bold text-limeAccent border border-limeAccent/30">
                Hype
              </span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* User profile / login pill */}
          {currentUser?.isLoggedIn ? (
            <Link
              href="/profile"
              className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-surfaceElevated border border-borderMuted hover:border-limeAccent/50 px-2 sm:px-3.5 py-1.5 text-xs transition"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-xs border border-borderMuted overflow-hidden shrink-0">
                {currentUser.avatar?.startsWith('http') ? (
                  <img src={currentUser.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  currentUser.avatar || '🎬'
                )}
              </span>
              <span className="hidden sm:inline font-mono font-bold text-textMain truncate max-w-[100px]">
                {currentUser.handle || currentUser.name || 'User'}
              </span>
              {!currentUser.isProfileSetup && currentUser.role !== 'creator' && (
                <span className="text-[10px] bg-limeAccent/20 text-limeAccent px-1.5 py-0.2 rounded-full font-mono hidden xs:inline">
                  Apply
                </span>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full bg-surfaceElevated border border-borderMuted hover:border-limeAccent/50 px-3 py-1.5 text-xs font-heading text-textMain transition hover:text-limeAccent"
            >
              <User className="h-3.5 w-3.5 text-limeAccent shrink-0" />
              <span className="hidden xs:inline">Sign In</span>
            </Link>
          )}

          {/* Outbid CTA */}
          {onOpenBidModal ? (
            <button
              onClick={() => {
                onOpenBidModal(1);
                setMobileMenuOpen(false);
              }}
              className="group relative inline-flex items-center gap-1.5 sm:gap-2 overflow-hidden rounded-full bg-limeAccent px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-heading font-bold text-[#070B0C] shadow-lg shadow-limeAccent/20 transition-all hover:brightness-110 active:scale-[0.98] shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-[#070B0C]" />
              <span className="hidden sm:inline">Outbid & Claim Rank</span>
              <span className="sm:hidden">Outbid</span>
            </button>
          ) : (
            <Link
              href="/?claim=1"
              className="group relative inline-flex items-center gap-1.5 sm:gap-2 overflow-hidden rounded-full bg-limeAccent px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-heading font-bold text-[#070B0C] shadow-lg shadow-limeAccent/20 transition-all hover:brightness-110 active:scale-[0.98] shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-[#070B0C]" />
              <span className="hidden sm:inline">Outbid & Claim Rank</span>
              <span className="sm:hidden">Outbid</span>
            </Link>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-xl bg-surfaceElevated border border-borderMuted text-textMuted hover:text-textMain focus:outline-none transition active:scale-95"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4 text-limeAccent" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-borderMuted bg-surface/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between rounded-xl px-4 py-2.5 font-heading text-sm font-bold transition ${pathname === '/'
              ? 'bg-surfaceElevated text-limeAccent border border-borderMuted'
              : 'text-textMuted hover:bg-surfaceElevated hover:text-textMain'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <Trophy className="h-4 w-4 text-limeAccent" />
              <span>Leaderboard</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 opacity-50" />
          </Link>

          <Link
            href="/campaigns"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between rounded-xl px-4 py-2.5 font-heading text-sm font-bold transition ${pathname.startsWith('/campaigns')
              ? 'bg-surfaceElevated text-limeAccent border border-borderMuted'
              : 'text-textMuted hover:bg-surfaceElevated hover:text-textMain'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <Megaphone className="h-4 w-4 text-emeraldAccent" />
              <span>Creator Campaigns</span>
            </div>
            <span className="rounded-md bg-emeraldAccent/15 px-2 py-0.5 text-[10px] font-mono font-bold text-emeraldAccent border border-emeraldAccent/20">
              Earn Cash
            </span>
          </Link>

          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between rounded-xl px-4 py-2.5 font-heading text-sm font-bold transition ${pathname === '/profile'
              ? 'bg-surfaceElevated text-limeAccent border border-borderMuted'
              : 'text-textMuted hover:bg-surfaceElevated hover:text-textMain'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <User className="h-4 w-4 text-textMain" />
              <span>Creator Profile</span>
            </div>
            {!currentUser?.isProfileSetup && (
              <span className="text-[10px] bg-limeAccent/20 text-limeAccent px-1.5 py-0.5 rounded font-mono">
                Setup
              </span>
            )}
          </Link>

          <Link
            href="/launch"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between rounded-xl px-4 py-2.5 font-heading text-sm font-bold transition ${pathname === '/launch'
              ? 'bg-surfaceElevated text-limeAccent border border-borderMuted'
              : 'text-textMuted hover:bg-surfaceElevated hover:text-textMain'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <Rocket className="h-4 w-4 text-limeAccent" />
              <span>Launch Packages & Hype</span>
            </div>
            <span className="rounded-md bg-limeAccent/15 px-2 py-0.5 text-[10px] font-mono font-bold text-limeAccent border border-limeAccent/30">
              New
            </span>
          </Link>

          {/* Quick status box inside mobile menu */}
          <div className="pt-2 border-t border-borderMuted/60 flex items-center justify-between text-xs text-textMuted px-1">
            <span>Marketplace: <strong className="text-emeraldAccent font-mono">Live Escrow</strong></span>
            <span>Ties: <strong className="text-textMain font-mono">Timestamp</strong></span>
          </div>
        </div>
      )}
    </header>
  );
}
