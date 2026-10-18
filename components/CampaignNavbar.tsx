'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Trophy,
  Megaphone,
  Wallet,
  Building2,
  PlusCircle,
  User,
  Menu,
  X,
  ArrowRight
} from 'lucide-react';
import { useCampaigns } from '../lib/CampaignContext';
import AzyraLogo from './AzyraLogo';

interface CampaignNavbarProps {
  onOpenCreateCampaign?: () => void;
  onOpenWithdraw?: () => void;
}

export default function CampaignNavbar({
  onOpenCreateCampaign,
  onOpenWithdraw,
}: CampaignNavbarProps) {
  const pathname = usePathname();
  const { currentUser, switchRole } = useCampaigns();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-borderMuted bg-surface/85 backdrop-blur-xl">
      {/* Top Banner with Two-Sided Role Switcher */}
      <div className="border-b border-borderMuted/60 bg-canvas/60 px-3 sm:px-4 py-1.5 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between flex-wrap gap-2">
          {/* Protocol Tag */}
          <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[11px]">
            <span className="flex h-2 w-2 rounded-full bg-emeraldAccent animate-pulse shrink-0"></span>
            <span className="font-semibold text-textMain sm:hidden">
              Azyra Rewards Protocol
            </span>
            <span className="font-semibold text-textMain hidden sm:inline">
              Azyra Content Rewards Protocol
            </span>
            <span className="text-borderMuted hidden sm:inline">•</span>
            <span className="text-textMuted hidden md:inline">
              Two-Sided CPM Short-Form Marketplace
            </span>
          </div>

          {/* Interactive Role Switcher Toggle */}
          <div className="flex items-center gap-1 bg-surfaceElevated rounded-xl p-0.5 sm:p-1 border border-borderMuted text-xs font-heading">
            <span className="text-[10px] sm:text-[11px] font-semibold text-textMuted px-1 hidden xs:inline">
              Persona:
            </span>
            <button
              onClick={() => switchRole('creator')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-bold transition text-[11px] sm:text-xs ${currentUser.role === 'creator'
                  ? 'bg-emeraldAccent text-[#0B0F10] shadow-sm'
                  : 'text-textMuted hover:text-textMain'
                }`}
            >
              <User className="h-3 w-3" />
              <span className="sm:hidden">Creator</span>
              <span className="hidden sm:inline">Creator / Clipper</span>
            </button>
            <button
              onClick={() => switchRole('brand')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-bold transition text-[11px] sm:text-xs ${currentUser.role === 'brand'
                  ? 'bg-limeAccent text-[#0B0F10] shadow-sm'
                  : 'text-textMuted hover:text-textMain'
                }`}
            >
              <Building2 className="h-3 w-3" />
              <span className="sm:hidden">Brand</span>
              <span className="hidden sm:inline">Brand Sponsor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/" className="group flex items-center gap-2">
            <AzyraLogo size="md" />
            <span className="rounded bg-emeraldAccent/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emeraldAccent border border-emeraldAccent/20 hidden sm:inline">
              Rewards
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5 text-sm font-heading font-medium">
            <Link
              href="/campaigns"
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 transition-colors ${pathname === '/campaigns'
                  ? 'bg-surfaceElevated text-limeAccent font-bold border border-borderMuted shadow-sm'
                  : 'text-textMuted hover:bg-surfaceElevated hover:text-textMain'
                }`}
            >
              <Megaphone className="h-4 w-4 text-emeraldAccent" />
              Campaign Marketplace
            </Link>

            <Link
              href="/profile"
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 transition-colors relative ${pathname === '/profile'
                  ? 'bg-surfaceElevated text-limeAccent font-bold border border-borderMuted shadow-sm'
                  : 'text-textMuted hover:bg-surfaceElevated hover:text-textMain'
                }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
              {currentUser?.isLoggedIn && !currentUser?.isProfileSetup && (
                <span className="h-2 w-2 rounded-full bg-limeAccent ring-2 ring-surface animate-pulse" />
              )}
            </Link>

            <Link
              href="/"
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 transition-colors ${pathname === '/'
                  ? 'bg-surfaceElevated text-limeAccent font-bold border border-borderMuted shadow-sm'
                  : 'text-textMuted hover:bg-surfaceElevated hover:text-textMain'
                }`}
            >
              <Trophy className="h-4 w-4 text-limeAccent" />
              Azyra Leaderboard
            </Link>
          </nav>
        </div>

        {/* User Balance & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!currentUser.isLoggedIn ? (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl bg-surfaceElevated border border-borderMuted hover:border-limeAccent/50 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-heading font-bold text-textMain transition hover:text-limeAccent"
            >
              <User className="h-3.5 w-3.5 text-limeAccent shrink-0" />
              <span className="hidden xs:inline">Sign In / Join</span>
              <span className="xs:hidden">Sign In</span>
            </Link>
          ) : currentUser.role === 'creator' ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Creator Wallet Card */}
              <div className="rounded-xl bg-surface border border-borderMuted px-2 sm:px-3 py-1 sm:py-1.5 text-right flex items-center gap-1.5 sm:gap-2.5">
                <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-emeraldAccent/15 text-emeraldAccent shrink-0">
                  <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] uppercase font-mono font-semibold text-textMuted leading-none">
                    Balance
                  </div>
                  <div className="font-mono font-black text-emeraldAccent text-xs sm:text-sm">
                    ${currentUser.wallet_balance.toFixed(2)}
                  </div>
                </div>
              </div>

              {onOpenWithdraw && (
                <button
                  onClick={onOpenWithdraw}
                  className="rounded-xl bg-emeraldAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs transition active:scale-[0.98] shadow-md shadow-emeraldAccent/20 shrink-0"
                >
                  Withdraw
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Brand Escrow Balance */}
              <div className="rounded-xl bg-surface border border-borderMuted px-2 sm:px-3 py-1 sm:py-1.5 text-right flex items-center gap-1.5 sm:gap-2.5">
                <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-limeAccent/15 text-limeAccent shrink-0">
                  <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] uppercase font-mono font-semibold text-textMuted leading-none">
                    Escrow
                  </div>
                  <div className="font-mono font-black text-limeAccent text-xs sm:text-sm">
                    ${currentUser.wallet_balance.toLocaleString()}
                  </div>
                </div>
              </div>

              {onOpenCreateCampaign && (
                <button
                  onClick={onOpenCreateCampaign}
                  className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs transition active:scale-[0.98] shadow-md shadow-limeAccent/20 shrink-0"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">+ New Campaign</span>
                  <span className="sm:hidden">New</span>
                </button>
              )}
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-xl bg-surfaceElevated border border-borderMuted text-textMuted hover:text-textMain focus:outline-none transition active:scale-95 shrink-0"
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
            href="/campaigns"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between rounded-xl px-4 py-2.5 font-heading text-sm font-bold transition ${pathname === '/campaigns'
              ? 'bg-surfaceElevated text-limeAccent border border-borderMuted'
              : 'text-textMuted hover:bg-surfaceElevated hover:text-textMain'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <Megaphone className="h-4 w-4 text-emeraldAccent" />
              <span>Campaign Marketplace</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 opacity-50" />
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
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between rounded-xl px-4 py-2.5 font-heading text-sm font-bold transition ${pathname === '/'
              ? 'bg-surfaceElevated text-limeAccent border border-borderMuted'
              : 'text-textMuted hover:bg-surfaceElevated hover:text-textMain'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <Trophy className="h-4 w-4 text-limeAccent" />
              <span>Azyra Leaderboard</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 opacity-50" />
          </Link>
        </div>
      )}
    </header>
  );
}
