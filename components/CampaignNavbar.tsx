'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Trophy, 
  Megaphone, 
  Wallet, 
  Sparkles, 
  ArrowRight, 
  User, 
  Building2, 
  PlusCircle, 
  Layers, 
  CheckCircle2,
  DollarSign
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

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
      {/* Top Banner with Two-Sided Role Switcher */}
      <div className="border-b border-zinc-900 bg-zinc-950/60 px-4 py-1.5 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between flex-wrap gap-2">
          {/* Protocol Tag */}
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-zinc-300">
              Whop Content Rewards Protocol
            </span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-500 hidden sm:inline">
              Two-Sided CPM Short-Form Campaign Marketplace
            </span>
          </div>

          {/* Interactive Role Switcher Toggle */}
          <div className="flex items-center gap-2 bg-zinc-900/90 rounded-xl p-1 border border-zinc-800 text-xs">
            <span className="text-[11px] font-semibold text-zinc-400 px-1">
              Active Persona:
            </span>
            <button
              onClick={() => switchRole('creator')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition ${
                currentUser.role === 'creator'
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <User className="h-3 w-3" />
              <span>Creator / Clipper</span>
            </button>
            <button
              onClick={() => switchRole('brand')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition ${
                currentUser.role === 'brand'
                  ? 'bg-amber-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Building2 className="h-3 w-3" />
              <span>Brand Sponsor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6 sm:gap-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <AzyraLogo size="md" />
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 hidden sm:inline">
              Rewards
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/campaigns"
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors ${
                pathname === '/campaigns'
                  ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-inner'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              <Megaphone className="h-4 w-4 text-emerald-400" />
              Campaign Marketplace
            </Link>

            <Link
              href="/"
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors ${
                pathname === '/'
                  ? 'bg-zinc-800 text-amber-400 font-semibold shadow-inner'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              <Trophy className="h-4 w-4 text-amber-400" />
              Azyra Leaderboard
            </Link>
          </nav>
        </div>

        {/* User Balance & Actions */}
        <div className="flex items-center gap-3">
          {currentUser.role === 'creator' ? (
            <div className="flex items-center gap-2.5">
              {/* Creator Wallet Card */}
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-right flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500">
                    Clipper Balance
                  </div>
                  <div className="font-mono font-black text-emerald-400 text-sm">
                    ${currentUser.wallet_balance.toFixed(2)}
                  </div>
                </div>
              </div>

              {onOpenWithdraw && (
                <button
                  onClick={onOpenWithdraw}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black px-3.5 py-2 text-xs transition active:scale-95 shadow-md shadow-emerald-500/20"
                >
                  Withdraw
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              {/* Brand Escrow Balance */}
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-right flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500">
                    Brand Escrow Fund
                  </div>
                  <div className="font-mono font-black text-amber-400 text-sm">
                    ${currentUser.wallet_balance.toLocaleString()}
                  </div>
                </div>
              </div>

              {onOpenCreateCampaign && (
                <button
                  onClick={onOpenCreateCampaign}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black px-3.5 py-2 text-xs transition active:scale-95 shadow-md shadow-amber-400/20"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>+ New Campaign</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
