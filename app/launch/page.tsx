'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Rocket,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ChevronDown
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import CreateCampaignModal from '../../components/CreateCampaignModal';
import { useCampaigns } from '../../lib/CampaignContext';
import { toast } from '@/lib/toast';

export default function LaunchPackagesPage() {
  const router = useRouter();
  const { currentUser } = useCampaigns();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<number>(1500);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const estimatedViews = Math.round((selectedBudget / 1.5) * 1000);
  const estimatedClips = Math.max(8, Math.round(selectedBudget / 40));
  const estimatedClicks = Math.round(estimatedViews * 0.024);

  const packages = [
    {
      id: 'seed_ignition',
      name: 'Seed Ignition',
      tagline: 'Indie builders and beta launches testing market demand.',
      price: 499,
      badge: 'Seed',
      isPopular: false,
      deliverables: [
        'Guaranteed Top #10 Leaderboard placement slot',
        '10+ Curated Creator video walkthroughs',
        '50,000+ Verified Algorithmic Video Impressions',
        'Direct do-follow permanent product link',
        'Real-time Click & UTM conversion tracking',
        '100% Escrow Protection guarantee',
      ],
      turnaround: '48h to Live Launch',
      actionLabel: 'Select Seed Tier',
    },
    {
      id: 'viral_breakout',
      name: 'Viral Breakout',
      tagline: 'Funded startups and SaaS products needing timeline dominance.',
      price: 1499,
      badge: 'Dominant Tier',
      isPopular: true,
      deliverables: [
        'Guaranteed Top #3 Sovereign placement slot',
        '35+ Vetted Tech & Dev Creator video clips',
        '250,000+ Guaranteed Verified Multi-Platform Views',
        'Custom Viral Opening Hooks & Script Angles',
        'Automated OCR Screenshot & View Count Auditing',
        'Featured Banner across Leaderboard & Marketplace',
        'Full organic creator usage rights for paid ads',
        '7-Day Accelerated Viral Sprint',
      ],
      turnaround: '24h to Syndication',
      actionLabel: 'Deploy Viral Breakout',
    },
    {
      id: 'market_dominance',
      name: 'Market Dominance',
      tagline: 'Flagship launches and major funding debut takeovers.',
      price: 3999,
      badge: 'Flagship',
      isPopular: false,
      deliverables: [
        'Sovereign #1 Reigning Listing with outbid protection',
        '80+ Tier-1 Tech Creators + 3 Dedicated Keynotes',
        '1,000,000+ Guaranteed Omnipresent Video Impressions',
        'Hybrid CPM Pool + Custom Conversion Milestone Bounties',
        'Dedicated 24/7 Launch War Room Slack/Telegram',
        'Investor-Grade Hype & Traffic Attribution dossier',
        'Permanent Reigning Hall of Fame spotlight',
      ],
      turnaround: 'Same-Day Mobilization',
      actionLabel: 'Deploy Market Dominance',
    },
  ];

  const handleSelectPackage = (pkgPrice: number, pkgName: string) => {
    if (!currentUser?.isLoggedIn) {
      toast.info('Sign In Required', 'Please sign in or register to fund your launch package.');
      router.push(`/login?redirect=/campaigns&action=create&package=${encodeURIComponent(pkgName)}&budget=${pkgPrice}`);
      return;
    }
    setIsCreateModalOpen(true);
  };

  const faqs = [
    {
      q: 'How does Azyra create organic market hype for my product launch?',
      a: 'Azyra combines financial leaderboard dominance with a syndicate of over 14,000 vetted creators across TikTok, YouTube Shorts, and X. Creators pull raw footage, record walkthroughs, and publish high-retention video hooks under verifiable escrow rules.',
    },
    {
      q: 'When do creators start producing and publishing content?',
      a: 'Creators begin clipping within 24 hours of package activation. Your campaign is instantly pushed to verified creators who submit live video URLs tracked via automated metrics.',
    },
    {
      q: 'How does the escrow protection guarantee work?',
      a: 'Your launch budget is locked in smart escrow. Funds are only disbursed when creators submit legitimate videos that achieve verified, organic view milestones.',
    },
    {
      q: 'Can I provide my own talking points, raw footage, and hooks?',
      a: 'Yes. Step 2 of the launch configuration lets you paste your Google Drive link with product screencasts, logos, opening hooks, talking points, and specific brand guidelines.',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-textMain flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-10">
        {/* HERO SECTION */}
        <div className="card-terminal p-6 sm:p-10">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-md bg-surfaceElevated px-2.5 py-1 text-[11px] font-sans font-semibold text-textMuted border border-borderMuted">
              <Rocket className="h-3.5 w-3.5 text-limeAccent" />
              <span>OFFICIAL PRODUCT LAUNCH PACKAGES</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-heading font-extrabold tracking-tight text-textMain leading-[1.15]">
              Syndicated Launch Packages. <br />
              Guaranteed View Delivery.
            </h1>

            <p className="text-xs sm:text-sm text-textMuted leading-relaxed">
              Don&apos;t launch to an empty room. Coordinate verified short-form tech creators, lock down prime leaderboard visibility, and build timeline presence backed by 100% protected escrow.
            </p>
          </div>
        </div>

        {/* 3 PACKAGES GRID */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-heading font-bold text-textMain">Available Launch Tiers</h2>
            <span className="text-[11px] text-textMuted">Protected escrow disbursement</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`card-terminal p-5 flex flex-col justify-between ${
                  pkg.isPopular ? 'border-limeAccent/60 ring-1 ring-limeAccent/30' : ''
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-heading font-bold text-textMain">{pkg.name}</h3>
                      <p className="text-xs text-textMuted mt-0.5 leading-snug">{pkg.tagline}</p>
                    </div>
                    <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-surfaceElevated text-textMuted border border-borderMuted shrink-0">
                      {pkg.badge}
                    </span>
                  </div>

                  <div className="rounded-md bg-surfaceElevated p-3 border border-borderMuted flex items-baseline gap-1.5">
                    <span className="text-2xl font-mono-numbers font-black text-textMain">
                      ${pkg.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-sans text-textMuted">USD / complete launch</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-sans font-semibold text-textMuted block">
                      Included Deliverables:
                    </span>
                    <ul className="space-y-2 text-xs text-textMuted">
                      {pkg.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-snug">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emeraldAccent shrink-0 mt-0.5" />
                          <span className="text-textMain/90">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 space-y-2 border-t border-borderMuted mt-5">
                  <div className="flex items-center justify-between text-[11px] text-textMuted">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-textMuted" /> Turnaround:
                    </span>
                    <strong className="text-textMain font-medium">{pkg.turnaround}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPackage(pkg.price, pkg.name)}
                    className={`w-full cursor-pointer rounded-md py-2.5 px-3 text-xs font-heading font-bold transition active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                      pkg.isPopular
                        ? 'bg-limeAccent hover:brightness-105 text-[#090A0C]'
                        : 'bg-surfaceElevated hover:bg-surface border border-borderMuted hover:border-borderStrong text-textMain'
                    }`}
                  >
                    <span>{pkg.actionLabel}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HYPE CALCULATOR */}
        <section className="card-terminal p-6 space-y-6">
          <div className="max-w-xl space-y-1">
            <h2 className="text-base font-heading font-bold text-textMain">
              Launch Reach Calculator
            </h2>
            <p className="text-xs text-textMuted">
              Adjust your intended budget to project estimated impressions, creator assets, and expected traffic.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs font-sans text-textMuted">
                    Escrow Budget
                  </span>
                  <span className="text-xl font-mono-numbers font-bold text-textMain">
                    ${selectedBudget.toLocaleString()} USD
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="250"
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-surfaceElevated rounded appearance-none cursor-pointer accent-limeAccent"
                />
              </div>

              <div className="rounded bg-surfaceElevated p-3 border border-borderMuted text-xs text-textMuted leading-relaxed">
                Funds are held in verified escrow and disbursed strictly upon view verification.
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-3 gap-2.5">
              <div className="rounded bg-surfaceElevated p-3 border border-borderMuted text-center">
                <span className="text-[10px] uppercase font-sans text-textMuted block">Est. Views</span>
                <strong className="text-base font-mono-numbers font-bold text-textMain">{(estimatedViews / 1000).toFixed(0)}k+</strong>
              </div>
              <div className="rounded bg-surfaceElevated p-3 border border-borderMuted text-center">
                <span className="text-[10px] uppercase font-sans text-textMuted block">Creator Clips</span>
                <strong className="text-base font-mono-numbers font-bold text-textMain">{estimatedClips}+</strong>
              </div>
              <div className="rounded bg-surfaceElevated p-3 border border-borderMuted text-center">
                <span className="text-[10px] uppercase font-sans text-textMuted block">Est. Clicks</span>
                <strong className="text-base font-mono-numbers font-bold text-emeraldAccent">{estimatedClicks}+</strong>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="space-y-3">
          <h2 className="text-sm font-heading font-bold text-textMain px-1">Frequently Asked Questions</h2>
          <div className="card-terminal divide-y divide-borderMuted overflow-hidden">
            {faqs.map((faq, index) => (
              <div key={index} className="p-4">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between text-left text-xs font-heading font-semibold text-textMain transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-textMuted transition-transform duration-200 shrink-0 ${
                      openFaq === index ? 'rotate-180 text-textMain' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <p className="mt-2 text-xs text-textMuted leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-borderMuted bg-surface/60 py-6 px-4 text-xs text-textMuted mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-textMuted">Azyra Protocol • Turnkey Launch Architecture</div>
          <div className="flex items-center gap-4 text-textMuted text-[11px]">
            <a href="/terms" className="hover:text-textMain transition">Terms</a>
            <a href="/privacy" className="hover:text-textMain transition">Privacy</a>
          </div>
        </div>
      </footer>

      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
