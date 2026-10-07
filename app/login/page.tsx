'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import {
  Sparkles,
  DollarSign,
  Video,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import AzyraLogo from '@/components/AzyraLogo';
import { useCampaigns } from '@/lib/CampaignContext';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, campaigns, joinCampaign } = useCampaigns();

  const redirectUrl = searchParams.get('redirect') || '/';
  const joinCampaignId = searchParams.get('join') || null;
  const targetCampaign = joinCampaignId ? campaigns.find((c) => c.id === joinCampaignId) : null;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.isLoggedIn) {
      if (joinCampaignId) {
        joinCampaign(joinCampaignId);
      }
      router.push(redirectUrl);
    }
  }, [currentUser, redirectUrl, joinCampaignId, router, joinCampaign]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: redirectUrl });
  };

  return (
    <div className="min-h-screen bg-canvas text-textMain flex flex-col justify-between font-sans selection:bg-limeAccent selection:text-[#0B0F10]">
      {/* Top Header */}
      <header className="border-b border-borderMuted bg-surface/85 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AzyraLogo size="md" />
          </Link>
          <Link href="/" className="text-xs font-heading font-semibold text-textMuted hover:text-textMain flex items-center gap-1.5 transition">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Marketplace</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-3xl border border-borderMuted bg-surface shadow-2xl overflow-hidden">
          
          {/* LEFT VALUE-PROPOSITION HERO PANEL */}
          <div className="lg:col-span-5 bg-gradient-to-br from-surfaceElevated to-surface p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-borderMuted relative">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-limeAccent/10 border border-limeAccent/20 px-3 py-1 text-xs font-mono font-bold text-limeAccent">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Pure Capital Protocol</span>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-textMain leading-tight">
                  The Leaderboard & Campaign Network Run by Capital
                </h2>
                <p className="text-xs sm:text-sm text-textMuted mt-3 leading-relaxed">
                  Join top tech founders, product creators, and viral video clippers monetizing short-form attention with automated escrow payouts.
                </p>
              </div>

              {/* Value proposition badges */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 rounded-xl bg-surface p-3.5 border border-borderMuted">
                  <div className="h-8 w-8 rounded-lg bg-limeAccent/15 text-limeAccent flex items-center justify-center shrink-0">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-heading font-bold text-textMain">Guaranteed Escrow Pools</h4>
                    <p className="text-[11px] text-textMuted mt-0.5">Sponsor campaigns hold secured capital released automatically per 1,000 views.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-surface p-3.5 border border-borderMuted">
                  <div className="h-8 w-8 rounded-lg bg-emeraldAccent/15 text-emeraldAccent flex items-center justify-center shrink-0">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-heading font-bold text-textMain">Multi-Platform Tracking</h4>
                    <p className="text-[11px] text-textMuted mt-0.5">Automated view polling for X (Twitter), Instagram Reels, and YouTube Shorts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-surface p-3.5 border border-borderMuted">
                  <div className="h-8 w-8 rounded-lg bg-surfaceElevated text-limeAccent flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-heading font-bold text-textMain">Zero Manipulation</h4>
                    <p className="text-[11px] text-textMuted mt-0.5">Pure financial hierarchy. Zero blackbox algorithms or subjective curation.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom trust footer */}
            <div className="pt-8 border-t border-borderMuted flex items-center justify-between text-textMuted font-mono text-[11px]">
              <span>MongoDB Atlas Cloud</span>
              <span>•</span>
              <span className="text-limeAccent font-bold">140+ Clippers</span>
            </div>
          </div>

          {/* RIGHT AUTH FORM PANEL */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
            
            {/* Target Campaign Banner if referred via Join */}
            {joinCampaignId && (
              <div className="mb-6 rounded-2xl bg-gradient-to-r from-limeAccent/15 via-surfaceElevated to-surface p-4 border border-limeAccent/30 shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl p-2 rounded-xl bg-canvas border border-borderMuted shrink-0">
                      {targetCampaign?.brand_logo || '🎬'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-limeAccent bg-limeAccent/10 px-2 py-0.5 rounded border border-limeAccent/20">
                          Auto-Enroll on Sign In
                        </span>
                        {targetCampaign?.category && (
                          <span className="text-[10px] font-heading text-textMuted hidden sm:inline">
                            {targetCampaign.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-heading font-bold text-textMain truncate mt-1">
                        {targetCampaign ? targetCampaign.title : 'Selected Campaign'}
                      </h3>
                      <p className="text-[11px] text-textMuted mt-0.5">
                        {targetCampaign 
                          ? `Earn $${targetCampaign.cpm_rate.toFixed(2)} CPM • Escrow Pool: $${targetCampaign.total_budget.toLocaleString()}`
                          : 'Sign in or register to join immediately'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-heading font-bold">Welcome to Azyra</h2>
              <p className="text-sm text-textMuted">Sign in to access the marketplace</p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 px-4 rounded-xl shadow-md transition hover:bg-gray-100 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>{isLoading ? "Signing in..." : "Continue with Google"}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas flex items-center justify-center text-limeAccent font-mono">Loading authentication...</div>}>
      <AuthContent />
    </Suspense>
  );
}
