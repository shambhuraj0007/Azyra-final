'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Rocket,
  Sparkles,
  Flame,
  TrendingUp,
  CheckCircle2,
  Trophy,
  Coins,
  ShieldCheck,
  Zap,
  ArrowRight,
  Video,
  Eye,
  Users,
  Target,
  BarChart3,
  ExternalLink,
  ChevronDown,
  HelpCircle,
  Clock,
  Layers,
  DollarSign
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import AzyraLogo from '../../components/AzyraLogo';
import CreateCampaignModal from '../../components/CreateCampaignModal';
import { useCampaigns } from '../../lib/CampaignContext';
import { toast } from '@/lib/toast';

export default function LaunchPackagesPage() {
  const router = useRouter();
  const { currentUser } = useCampaigns();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<number>(1500);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Dynamic calculations based on slider
  const estimatedViews = Math.round((selectedBudget / 1.5) * 1000);
  const estimatedClips = Math.max(8, Math.round(selectedBudget / 40));
  const estimatedClicks = Math.round(estimatedViews * 0.024);
  const estimatedRank = selectedBudget >= 4000 ? '#1 Sovereign' : selectedBudget >= 1500 ? 'Top #3' : 'Top #10';

  const packages = [
    {
      id: 'seed_ignition',
      name: 'Seed Ignition',
      tagline: 'Ideal for indie hackers, new tool releases, and early beta launches.',
      price: 499,
      badge: 'Quick Launch',
      badgeColor: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
      isPopular: false,
      deliverables: [
        'Guaranteed Top #10 Leaderboard Placement slot',
        '10+ Curated Creator clips (Shorts, Reels & X)',
        '50,000+ Verified Algorithmic Video Impressions',
        'Direct do-follow permanent product backlink',
        'Automated real-time Click & UTM conversion tracking',
        '100% Escrow Protection with zero fraud guarantee',
      ],
      turnaround: '48 Hours to Live Campaign',
      actionLabel: 'Select Seed Ignition ($499)',
    },
    {
      id: 'viral_breakout',
      name: 'Viral Breakout',
      tagline: 'For funded startups, AI tools, and SaaS looking to dominate the timeline.',
      price: 1499,
      badge: 'Most Popular • 5x Hype',
      badgeColor: 'border-limeAccent/40 bg-limeAccent/15 text-limeAccent',
      isPopular: true,
      deliverables: [
        'Guaranteed Top #3 Prime Sovereign placement slot',
        '35+ Vetted Tech & Dev Influencer video walkthroughs',
        '250,000+ Guaranteed Verified Multi-Platform Views',
        'Custom Viral Opening Hooks & Script Angles developed for you',
        'Automated OCR Screenshot & View Count Auditing',
        'Featured Prime Banner across Leaderboard & Marketplace',
        'Full organic creator usage rights for your meta/paid ads',
        '7-Day Accelerated Viral Sprint with real-time stats',
      ],
      turnaround: '24 Hours to Full Syndication',
      actionLabel: 'Deploy Viral Breakout ($1,499)',
    },
    {
      id: 'market_dominance',
      name: 'Market Dominance',
      tagline: 'Complete timeline takeover for major funding debuts and flagship launches.',
      price: 3999,
      badge: 'Maximum Market Hype',
      badgeColor: 'border-cyan-400/40 bg-cyan-400/15 text-cyan-300',
      isPopular: false,
      deliverables: [
        'Sovereign #1 Reigning Listing with outbid protection',
        '80+ Tier-1 Tech Creators + 3 Dedicated Keynote Sponsorships',
        '1,000,000+ Guaranteed Omnipresent Video Impressions',
        'Hybrid Views Pool (CPM) + Custom Conversion Action Bounties',
        'Dedicated 24/7 War Room Launch Director on Telegram/Slack',
        'Investor-Grade Hype & Traffic Attribution dossier',
        'Permanent Reigning Hall of Fame permanent spotlight',
      ],
      turnaround: 'Same-Day Priority Mobilization',
      actionLabel: 'Deploy Market Dominance ($3,999)',
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
      a: 'Azyra combines pure financial leaderboard dominance with a syndicate of over 14,000 vetted creators across TikTok, YouTube Shorts, and X. When you fund a launch package, creators immediately access your raw product assets, test your UI, and publish high-retention video hooks using our agreed CPM or Custom Success escrow rules.',
    },
    {
      q: 'When do creators start producing and publishing content?',
      a: 'Creators begin clipping and publishing within 24 hours of package activation. Your campaign is instantly pushed to verified creators on the marketplace who submit live video URLs tracked via automated OCR and API metrics.',
    },
    {
      q: 'How does the escrow protection guarantee work?',
      a: 'Your launch budget is safely locked inside Azyra smart escrow. Funds are only disbursed when creators submit legitimate videos that achieve verified, organic view milestones or fulfill your custom criteria. Bot views, artificial pods, and deleted posts are rejected automatically.',
    },
    {
      q: 'Can I provide my own talking points, raw footage, and hooks?',
      a: 'Absolutely. Step 2 of the launch configuration lets you paste your Google Drive link with product screencasts, B-roll, logos, opening hooks, talking points, and specific guidelines on what to feature and what to avoid.',
    },
    {
      q: 'Can I launch alongside Product Hunt, Hacker News, or Twitter launches?',
      a: 'Yes! In fact, that is where Azyra shines brightest. Coordinating your Azyra creator syndicate on the day of your Product Hunt or X announcement creates a compounding halo effect that pushes you to #1 across platforms.',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-textMain flex flex-col font-sans selection:bg-limeAccent selection:text-[#0B0F10]">
      {/* Navigation */}
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-16 sm:space-y-24">
        {/* HERO SECTION: High-impact Launch Hype */}
        <section className="relative overflow-hidden rounded-3xl border border-borderMuted/80 bg-gradient-to-b from-surface/90 via-surfaceElevated/40 to-surface/90 p-6 sm:p-12 lg:p-16 shadow-2xl backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
          <div className="absolute -top-36 -right-24 h-[440px] w-[440px] rounded-full bg-limeAccent/15 blur-[130px] pointer-events-none" />
          <div className="absolute -bottom-36 -left-20 h-[380px] w-[380px] rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-limeAccent/50 to-transparent" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-limeAccent/15 px-3.5 py-1.5 text-xs font-mono font-bold text-limeAccent border border-limeAccent/30 shadow-inner">
              <Rocket className="h-4 w-4 text-limeAccent animate-pulse" />
              <span>OFFICIAL PRODUCT LAUNCH PROTOCOL</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-textMain leading-[1.1]">
              Launch Your Product. <br />
              <span className="text-limeAccent">Create Unstoppable Market Hype.</span>
            </h1>

            <p className="text-sm sm:text-base text-textMuted max-w-2xl leading-relaxed">
              Don&apos;t launch to an empty room. Mobilize a syndicated army of 14,000+ tech creators, lock down top leaderboard visibility, and flood TikTok, X, and YouTube Shorts with authentic viral walkthroughs.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <a
                href="#packages"
                className="rounded-2xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-extrabold px-8 py-4 text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-limeAccent/25 transition active:scale-[0.98]"
              >
                <Sparkles className="h-4 w-4 fill-[#0B0F10]" />
                <span>Explore Launch Packages</span>
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </a>

              <button
                type="button"
                onClick={() => handleSelectPackage(1500, 'Custom Launch')}
                className="rounded-2xl bg-surfaceElevated hover:bg-surface border border-borderMuted hover:border-limeAccent/40 px-6 py-4 text-sm font-heading font-bold text-textMain transition flex items-center justify-center gap-2"
              >
                <Coins className="h-4 w-4 text-limeAccent" />
                <span>Custom Escrow Campaign</span>
              </button>
            </div>

            {/* Quick Proof Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-borderMuted/60 text-xs font-mono">
              <div>
                <span className="text-textMuted block text-[10px] uppercase">Total Views Delivered</span>
                <strong className="text-textMain text-sm sm:text-base font-bold font-mono">124,500,000+</strong>
              </div>
              <div>
                <span className="text-textMuted block text-[10px] uppercase">Products Launched</span>
                <strong className="text-limeAccent text-sm sm:text-base font-bold font-mono">480+ Startups</strong>
              </div>
              <div>
                <span className="text-textMuted block text-[10px] uppercase">Active Creators</span>
                <strong className="text-textMain text-sm sm:text-base font-bold font-mono">14,200+ Vetted</strong>
              </div>
              <div>
                <span className="text-textMuted block text-[10px] uppercase">Protection Rail</span>
                <strong className="text-emeraldAccent text-sm sm:text-base font-bold font-mono">100% Escrow</strong>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE 3 TURNKEY PACKAGES */}
        <section id="packages" className="space-y-8 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-surfaceElevated px-3 py-1 text-xs font-mono font-bold text-limeAccent border border-borderMuted">
              <Zap className="h-3.5 w-3.5 text-limeAccent" />
              <span>Turnkey Launch Tiers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-textMain tracking-tight">
              Pick Your Launch Package
            </h2>
            <p className="text-xs sm:text-sm text-textMuted">
              Every package is backed by protected escrow funds, automated OCR view verification, and instant marketplace deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-3xl flex flex-col justify-between p-6 sm:p-8 transition-all duration-300 backdrop-blur-xl ${
                  pkg.isPopular
                    ? 'border-2 border-limeAccent bg-gradient-to-b from-surfaceElevated via-surface to-surface shadow-2xl shadow-limeAccent/15 lg:-translate-y-2'
                    : 'border border-borderMuted bg-surface/90 hover:border-limeAccent/40 hover:bg-surfaceElevated/60 shadow-xl'
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-limeAccent text-[#0B0F10] px-4 py-1 text-[11px] font-heading font-extrabold shadow-md uppercase tracking-wider">
                    ★ Founder Choice
                  </div>
                )}

                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-heading font-bold text-textMain">{pkg.name}</h3>
                      <p className="text-xs text-textMuted mt-1 leading-relaxed">{pkg.tagline}</p>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border shrink-0 ${pkg.badgeColor}`}>
                      {pkg.badge}
                    </span>
                  </div>

                  {/* Price Block */}
                  <div className="rounded-2xl bg-canvas/80 border border-borderMuted p-4 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-mono font-extrabold text-textMain">
                      ${pkg.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-mono text-textMuted">USD / complete launch</span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-textMuted block">
                      Everything Included:
                    </span>
                    <ul className="space-y-2.5 text-xs text-textMuted">
                      {pkg.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 leading-snug">
                          <CheckCircle2 className="h-4 w-4 text-limeAccent shrink-0 mt-0.5" />
                          <span className="text-textMain/90">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 space-y-3 border-t border-borderMuted/70 mt-6">
                  <div className="flex items-center justify-between text-[11px] font-mono text-textMuted">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-limeAccent" /> Turnaround:
                    </span>
                    <strong className="text-textMain">{pkg.turnaround}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPackage(pkg.price, pkg.name)}
                    className={`w-full cursor-pointer rounded-2xl py-3.5 px-4 text-xs sm:text-sm font-heading font-extrabold transition active:scale-[0.98] flex items-center justify-center gap-2 ${
                      pkg.isPopular
                        ? 'bg-limeAccent hover:brightness-110 text-[#0B0F10] shadow-xl shadow-limeAccent/20'
                        : 'bg-surfaceElevated hover:bg-canvas border border-borderMuted text-textMain hover:border-limeAccent/50'
                    }`}
                  >
                    <span>{pkg.actionLabel}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: INTERACTIVE LAUNCH HYPE SIMULATOR */}
        <section className="rounded-3xl border border-borderMuted bg-surface/90 p-6 sm:p-10 shadow-2xl space-y-8 backdrop-blur-xl">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-limeAccent/10 px-3 py-1 text-xs font-mono font-bold text-limeAccent border border-limeAccent/30">
              <BarChart3 className="h-3.5 w-3.5 text-limeAccent" />
              <span>Custom Hype Calculator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-textMain">
              Simulate Your Launch Day Reach
            </h2>
            <p className="text-xs text-textMuted leading-relaxed">
              Adjust your intended launch budget to project estimated video views, creator clips, expected clicks, and leaderboard rank dominance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Slider Column */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs font-heading font-bold uppercase text-textMuted">
                    Escrow Launch Budget
                  </span>
                  <span className="text-2xl sm:text-3xl font-mono font-extrabold text-limeAccent">
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
                  className="w-full h-2.5 bg-surfaceElevated rounded-lg appearance-none cursor-pointer accent-limeAccent"
                />
                <div className="flex justify-between text-[10px] font-mono text-textMuted mt-1.5">
                  <span>$500 (Minimum)</span>
                  <span>$5,000</span>
                  <span>$10,000+ (High Octane)</span>
                </div>
              </div>

              <div className="rounded-2xl bg-canvas p-4 border border-borderMuted space-y-2 text-xs text-textMuted">
                <span className="text-limeAccent font-heading font-bold block">
                  ⚡ Automatic Dynamic Escrow Disbursement
                </span>
                <p className="leading-relaxed">
                  Every dollar in this budget is locked safely in your product&apos;s verified escrow pool. Verified creators earn strictly per 1,000 authentic views or completed milestone approvals.
                </p>
              </div>
            </div>

            {/* Projected Outputs Column */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-3.5">
              <div className="rounded-2xl border border-borderMuted bg-surfaceElevated p-4 space-y-1">
                <span className="text-[10px] uppercase font-mono text-textMuted flex items-center gap-1">
                  <Eye className="h-3 w-3 text-limeAccent" /> Guaranteed Views
                </span>
                <strong className="text-xl sm:text-2xl font-mono font-extrabold text-textMain block">
                  ~{estimatedViews.toLocaleString()}
                </strong>
                <span className="text-[10px] text-emeraldAccent font-mono">Organic Reach</span>
              </div>

              <div className="rounded-2xl border border-borderMuted bg-surfaceElevated p-4 space-y-1">
                <span className="text-[10px] uppercase font-mono text-textMuted flex items-center gap-1">
                  <Video className="h-3 w-3 text-cyan-400" /> Creator Clips
                </span>
                <strong className="text-xl sm:text-2xl font-mono font-extrabold text-textMain block">
                  ~{estimatedClips} Videos
                </strong>
                <span className="text-[10px] text-cyan-400 font-mono">TikTok, Reels, X</span>
              </div>

              <div className="rounded-2xl border border-borderMuted bg-surfaceElevated p-4 space-y-1">
                <span className="text-[10px] uppercase font-mono text-textMuted flex items-center gap-1">
                  <Target className="h-3 w-3 text-amber-400" /> Projected Clicks
                </span>
                <strong className="text-xl sm:text-2xl font-mono font-extrabold text-textMain block">
                  ~{estimatedClicks.toLocaleString()}
                </strong>
                <span className="text-[10px] text-amber-400 font-mono">Direct to Website</span>
              </div>

              <div className="rounded-2xl border border-borderMuted bg-surfaceElevated p-4 space-y-1">
                <span className="text-[10px] uppercase font-mono text-textMuted flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-limeAccent" /> Expected Rank
                </span>
                <strong className="text-xl sm:text-2xl font-mono font-extrabold text-limeAccent block">
                  {estimatedRank}
                </strong>
                <span className="text-[10px] text-textMuted font-mono">Leaderboard Stature</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: THE AZYRA HYPE FLYWHEEL (How It Works) */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-heading font-extrabold text-textMain tracking-tight">
              The Azyra Market Hype Flywheel
            </h2>
            <p className="text-xs sm:text-sm text-textMuted">
              Why top tech companies use Azyra instead of traditional PR agencies or static ads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-borderMuted bg-surface/80 p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-limeAccent/15 text-limeAccent font-mono font-bold border border-limeAccent/30">
                01
              </div>
              <h3 className="font-heading font-bold text-textMain text-sm">Financial Rank Dominance</h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Your total bid locks in your rank on the Sovereign Leaderboard. High-conviction placement instantly signals legitimacy to tech early adopters and investors.
              </p>
            </div>

            <div className="rounded-2xl border border-borderMuted bg-surface/80 p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-400 font-mono font-bold border border-cyan-400/30">
                02
              </div>
              <h3 className="font-heading font-bold text-textMain text-sm">Clipper Army Mobilization</h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Hundreds of short-form video editors take your product footage, test prompts, and craft rapid-fire hooks tailored specifically for TikTok, Reels, and X algorithms.
              </p>
            </div>

            <div className="rounded-2xl border border-borderMuted bg-surface/80 p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 font-mono font-bold border border-amber-400/30">
                03
              </div>
              <h3 className="font-heading font-bold text-textMain text-sm">Automated OCR View Audit</h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Every video is audited by computer vision OCR and direct API polling. View milestones must be verified authentic before any escrow reward unlocks.
              </p>
            </div>

            <div className="rounded-2xl border border-borderMuted bg-surface/80 p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emeraldAccent/15 text-emeraldAccent font-mono font-bold border border-emeraldAccent/30">
                04
              </div>
              <h3 className="font-heading font-bold text-textMain text-sm">Permanent Compound Traffic</h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Unlike sponsored ads that stop when your budget ends, creator videos and leaderboard rankings live permanently, driving compound backlinks and visits for months.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: FOUNDER FAQS */}
        <section className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-textMain">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-textMuted">
              Everything you need to know about launching your product with Azyra packages.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-borderMuted bg-surface/80 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-heading font-semibold text-xs sm:text-sm text-textMain hover:text-limeAccent transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-textMuted transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-limeAccent' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs text-textMuted leading-relaxed border-t border-borderMuted/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* BOTTOM CTA: Ready to Launch */}
        <section className="relative overflow-hidden rounded-3xl border border-limeAccent/40 bg-gradient-to-r from-surface via-surfaceElevated to-surface p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-textMain tracking-tight">
              Ready to Turn Your Launch into an Event?
            </h2>
            <p className="text-xs sm:text-sm text-textMuted leading-relaxed">
              Join hundreds of companies that launched with Azyra. Set up your campaign in under 3 minutes with full escrow security.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleSelectPackage(selectedBudget, 'Custom Launch')}
              className="rounded-2xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-extrabold px-8 py-4 text-sm flex items-center gap-2 shadow-xl shadow-limeAccent/25 transition active:scale-[0.98] cursor-pointer"
            >
              <Rocket className="h-4 w-4 fill-[#0B0F10]" />
              <span>Launch Product Now (${selectedBudget.toLocaleString()})</span>
            </button>

            <Link
              href="/campaigns"
              className="rounded-2xl bg-surfaceElevated hover:bg-canvas border border-borderMuted px-6 py-4 text-sm font-heading font-bold text-textMain hover:text-limeAccent transition"
            >
              <span>Explore Active Marketplace</span>
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-borderMuted bg-canvas/80 py-10 px-4 text-xs text-textMuted mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <AzyraLogo size="sm" />
            <p className="text-[11px] text-textMuted">Pure Financial Product Discovery & Creator Bounty Protocol</p>
          </div>

          <div className="flex items-center gap-6 text-textMuted">
            <Link href="/" className="hover:text-limeAccent transition">
              Leaderboard
            </Link>
            <Link href="/campaigns" className="hover:text-emeraldAccent transition">
              Creator Campaigns
            </Link>
            <Link href="/launch" className="hover:text-limeAccent text-limeAccent font-bold transition">
              Launch Packages
            </Link>
            <Link href="/terms" className="hover:text-limeAccent transition">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-limeAccent transition">
              Privacy
            </Link>
          </div>

          <div className="text-right text-[11px] text-textMuted font-mono">
            All escrow budgets backed by Azyra Protocol
          </div>
        </div>
      </footer>

      {/* Campaign Creation Modal if triggered from packages */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

