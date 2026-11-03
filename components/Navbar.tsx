'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Megaphone, User, Menu, X, ArrowUpRight, Rocket } from 'lucide-react';
import AzyraLogo from './AzyraLogo';
import ThemeToggle from './ThemeToggle';
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
    <header className="sticky top-0 z-40 border-b border-borderMuted bg-surface/90 backdrop-blur-md transition-colors">
      {/* Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3">
        <div className="flex items-center gap-6 sm:gap-8">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <AzyraLogo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs font-heading font-medium">
            <Link
              href="/"
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors ${pathname === '/'
                  ? 'bg-surfaceElevated text-textMain font-bold border border-borderStrong shadow-xs'
                  : 'text-textMuted hover:bg-surfaceElevated hover:text-textMain'
                }`}
            >
              <Trophy className="h-3.5 w-3.5 text-textMuted" />
              Leaderboard
            </Link>

            <Link
              href="/campaigns"
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors ${pathname.startsWith('/campaigns')
                  ? 'bg-surfaceElevated text-textMain font-bold border border-borderStrong shadow-xs'
                  : 'text-textMuted hover:bg-surfaceElevated hover:text-textMain'
                }`}
            >
              <Megaphone className="h-3.5 w-3.5 text-iceBlue" />
              Creator Campaigns
            </Link>

            <Link
              href="/launch"
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${pathname === '/launch'
                  ? 'bg-surfaceElevated text-textMain font-bold border border-borderStrong shadow-xs'
                  : 'text-textMuted hover:bg-surfaceElevated hover:text-textMain'
                }`}
            >
              <Rocket className="h-3.5 w-3.5 text-limeAccent" />
              <span>Launch Packages</span>
            </Link>

            <Link
              href="/profile"
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors ${pathname === '/profile'
                  ? 'bg-surfaceElevated text-textMain font-bold border border-borderStrong shadow-xs'
                  : 'text-textMuted hover:bg-surfaceElevated hover:text-textMain'
                }`}
            >
              <User className="h-3.5 w-3.5 text-textMuted" />
              Portfolio
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* User profile / login pill */}
          {currentUser?.isLoggedIn ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-md bg-surfaceElevated border border-borderMuted hover:border-borderStrong px-2.5 py-1 text-xs transition"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-surface text-[11px] border border-borderMuted overflow-hidden shrink-0">
                {currentUser.avatar?.startsWith('http') ? (
                  <img src={currentUser.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  currentUser.avatar || '🎬'
                )}
              </span>
              <span className="hidden sm:inline font-mono text-[11px] font-medium text-textMain truncate max-w-[100px]">
                {currentUser.handle || currentUser.name || 'User'}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-md bg-surfaceElevated border border-borderMuted hover:border-borderStrong px-3 py-1.5 text-xs font-heading font-medium text-textMain transition"
            >
              <User className="h-3.5 w-3.5 text-textMuted shrink-0" />
              <span className="hidden xs:inline">Sign In</span>
            </Link>
          )}

          {/* Primary Action Button: Outbid & Claim Rank */}
          {onOpenBidModal ? (
            <button
              onClick={() => {
                onOpenBidModal(1);
                setMobileMenuOpen(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-limeAccent px-3.5 py-1.5 text-xs font-heading font-bold text-[#090A0C] transition hover:brightness-105 active:scale-[0.98] shrink-0 shadow-xs cursor-pointer"
            >
              <span>Outbid & Claim</span>
              <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          ) : (
            <Link
              href="/?claim=1"
              className="inline-flex items-center gap-1.5 rounded-md bg-limeAccent px-3.5 py-1.5 text-xs font-heading font-bold text-[#090A0C] transition hover:brightness-105 active:scale-[0.98] shrink-0 shadow-xs cursor-pointer"
            >
              <span>Outbid & Claim</span>
              <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </Link>
          )}

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-md bg-surfaceElevated border border-borderMuted text-textMuted hover:text-textMain transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-borderMuted bg-surface px-4 py-3 space-y-1.5 shadow-xl">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between rounded-md px-3 py-2 text-xs font-heading font-semibold transition ${pathname === '/' ? 'bg-surfaceElevated text-textMain border border-borderStrong' : 'text-textMuted hover:bg-surfaceElevated'
              }`}
          >
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-textMuted" />
              <span>Leaderboard</span>
            </div>
          </Link>

          <Link
            href="/campaigns"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between rounded-md px-3 py-2 text-xs font-heading font-semibold transition ${pathname.startsWith('/campaigns') ? 'bg-surfaceElevated text-textMain border border-borderStrong' : 'text-textMuted hover:bg-surfaceElevated'
              }`}
          >
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-iceBlue" />
              <span>Creator Campaigns</span>
            </div>
          </Link>

          <Link
            href="/launch"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between rounded-md px-3 py-2 text-xs font-heading font-semibold transition ${pathname === '/launch' ? 'bg-surfaceElevated text-textMain border border-borderStrong' : 'text-textMuted hover:bg-surfaceElevated'
              }`}
          >
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-limeAccent" />
              <span>Launch Packages</span>
            </div>
          </Link>

          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between rounded-md px-3 py-2 text-xs font-heading font-semibold transition ${pathname === '/profile' ? 'bg-surfaceElevated text-textMain border border-borderStrong' : 'text-textMuted hover:bg-surfaceElevated'
              }`}
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-textMuted" />
              <span>Creator Portfolio</span>
            </div>
          </Link>
        </div>
      )}
    </header>
  );
}
