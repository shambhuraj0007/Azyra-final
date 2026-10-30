import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import AzyraLogo from '../../components/AzyraLogo';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Database, 
  Server, 
  UserCheck, 
  FileCheck, 
  Scale, 
  ChevronRight,
  CheckCircle2,
  Bell
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy • AZYRA',
  description: 'Learn how Azyra collects, protects, uses, and respects your personal data and social metrics.',
};

export default function PrivacyPage() {
  const lastUpdated = 'October 24, 2026';

  const sections = [
    { id: 'overview', title: '1. Overview & Commitment' },
    { id: 'data-we-collect', title: '2. Information We Collect' },
    { id: 'how-we-use-data', title: '3. How We Use Your Information' },
    { id: 'public-data', title: '4. Public Leaderboard & Social Data' },
    { id: 'third-party-sharing', title: '5. Third-Party Services & Processors' },
    { id: 'cookies-storage', title: '6. Cookies & Local Storage' },
    { id: 'security', title: '7. Data Security & Storage' },
    { id: 'retention', title: '8. Data Retention & Deletion Rights' },
    { id: 'user-rights', title: '9. Your Privacy Rights (GDPR / CCPA)' },
    { id: 'children', title: '10. Children\'s Privacy' },
    { id: 'changes', title: '11. Updates to this Policy' },
    { id: 'contact', title: '12. Privacy Inquiries & DPO' },
  ];

  return (
    <div className="min-h-screen bg-canvas text-textMain selection:bg-limeAccent selection:text-[#0B0F10] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Breadcrumb & Navigation Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-borderMuted">
          <div className="flex items-center gap-2 text-xs font-mono text-textMuted">
            <Link href="/" className="hover:text-limeAccent transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-textMain font-medium">Privacy Policy</span>
          </div>

          {/* Quick tab switcher between Terms and Privacy */}
          <div className="inline-flex p-1 rounded-xl bg-surface border border-borderMuted text-xs font-heading font-medium">
            <Link
              href="/terms"
              className="px-3.5 py-1.5 rounded-lg text-textMuted hover:text-textMain transition flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" />
              Terms of Service
            </Link>
            <span className="px-3.5 py-1.5 rounded-lg bg-surfaceElevated text-limeAccent font-bold border border-borderMuted shadow-sm flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Privacy Policy
            </span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="relative rounded-2xl bg-surface border border-borderMuted p-6 sm:p-10 mb-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emeraldAccent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emeraldAccent/10 border border-emeraldAccent/20 text-emeraldAccent font-mono text-xs font-semibold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Privacy Protection & Data Protocol
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-textMain tracking-tight">
              Azyra Privacy Policy
            </h1>
            <p className="mt-4 text-sm sm:text-base text-textMuted leading-relaxed">
              We value your trust and are transparent about how we collect, process, and safeguard your personal details, creator analytics, and payment information on Azyra.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-textMuted">
              <span className="bg-canvas/80 px-2.5 py-1 rounded-md border border-borderMuted">
                Effective: October 2026
              </span>
              <span className="bg-canvas/80 px-2.5 py-1 rounded-md border border-borderMuted">
                Last Updated: {lastUpdated}
              </span>
              <span className="text-emeraldAccent font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> GDPR & CCPA Aligned
              </span>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar ToC + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Table of contents sticky sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 rounded-xl border border-borderMuted bg-surface p-5 space-y-4 shadow-lg">
              <h3 className="text-xs font-mono uppercase font-bold text-textMuted tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-emeraldAccent" />
                Table of Contents
              </h3>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block px-2.5 py-1.5 rounded-lg text-xs text-textMuted hover:text-textMain hover:bg-surfaceElevated transition truncate"
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>

              <div className="pt-4 border-t border-borderMuted/80">
                <div className="p-3 rounded-lg bg-canvas border border-borderMuted/60 text-xs">
                  <div className="flex items-center gap-2 text-emeraldAccent font-heading font-bold mb-1">
                    <UserCheck className="w-4 h-4" /> Exercise Rights
                  </div>
                  <p className="text-textMuted text-[11px] leading-relaxed">
                    Want to request a data export or account erasure? Email{' '}
                    <a href="mailto:privacy@azyra.app" className="text-limeAccent underline underline-offset-2">
                      privacy@azyra.app
                    </a>.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Body Prose */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-12 text-sm sm:text-base leading-relaxed text-textMuted">
            
            {/* Section 1 */}
            <section id="overview" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                1. Overview & Commitment
              </h2>
              <p>
                This Privacy Policy explains how Azyra (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, shares, and protects information about you when you use our website, financial leaderboard, creator marketplace, and related services (collectively, the &quot;Platform&quot;).
              </p>
              <p>
                We believe in data minimization. We only collect the minimal personal and technical information necessary to run fair ranking auctions, verify authentic creator submissions, and process financial rewards.
              </p>
            </section>

            {/* Section 2 */}
            <section id="data-we-collect" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3 flex items-center justify-between">
                <span>2. Information We Collect</span>
                <Database className="w-5 h-5 text-limeAccent" />
              </h2>
              <p>Depending on whether you participate as a Brand, Creator, or Visitor, we may collect:</p>
              
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-xl bg-surface border border-borderMuted space-y-2">
                  <div className="flex items-center gap-2 text-textMain font-heading font-bold text-sm">
                    <UserCheck className="w-4 h-4 text-limeAccent" />
                    Account & Profile Information
                  </div>
                  <p className="text-xs sm:text-sm text-textMuted">
                    Your name, email address, password hashes, brand product names, product URLs, logos, and creator bios provided during sign up or profile onboarding.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-borderMuted space-y-2">
                  <div className="flex items-center gap-2 text-textMain font-heading font-bold text-sm">
                    <Eye className="w-4 h-4 text-emeraldAccent" />
                    Connected Social Channels & Content URLs
                  </div>
                  <p className="text-xs sm:text-sm text-textMuted">
                    Public usernames or profile URLs on YouTube, X (Twitter), TikTok, Instagram, and GitHub. Content URLs submitted for campaign verification, along with post timestamps and engagement screenshots.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-borderMuted space-y-2">
                  <div className="flex items-center gap-2 text-textMain font-heading font-bold text-sm">
                    <Server className="w-4 h-4 text-limeAccent" />
                    Financial & Payout Information
                  </div>
                  <p className="text-xs sm:text-sm text-textMuted">
                    Web3 public wallet addresses (e.g. Solana or EVM public keys), payout recipient identifiers, invoice details, or payment transaction IDs. <em>Note: Sensitive credit card numbers and full bank account credentials are processed directly by our PCI-compliant payment gateways and never touch our servers.</em>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-borderMuted space-y-2">
                  <div className="flex items-center gap-2 text-textMain font-heading font-bold text-sm">
                    <FileCheck className="w-4 h-4 text-emeraldAccent" />
                    Automated Log & Device Data
                  </div>
                  <p className="text-xs sm:text-sm text-textMuted">
                    IP address, browser type, operating system, referrer URL, pages visited, and interaction timestamps for fraud prevention and system diagnostics.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="how-we-use-data" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                3. How We Use Your Information
              </h2>
              <p>We use collected data solely for legitimate business operations:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-textMain">Leaderboard Operation & Ranking:</strong> Calculating cumulative daily and all-time capital contributions to rank tech products transparently.
                </li>
                <li>
                  <strong className="text-textMain">Campaign Bounty Verification:</strong> Auditing submitted content for authenticity, verifying view thresholds and engagement metrics, and preventing automated bot fraud.
                </li>
                <li>
                  <strong className="text-textMain">Disbursement of Earnings:</strong> Facilitating creator reward payouts, handling withdrawal requests, and maintaining transaction logs for auditing.
                </li>
                <li>
                  <strong className="text-textMain">Security & Anti-Fraud:</strong> Monitoring anomalous bidding activities, preventing chargeback abuse, and securing creator and brand accounts.
                </li>
                <li>
                  <strong className="text-textMain">Essential Platform Communications:</strong> Sending transactional notices, submission review results, payout confirmations, and system updates.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="public-data" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                4. Public Leaderboard & Social Data
              </h2>
              <p>
                Certain information on Azyra is inherently public by platform design:
              </p>
              <div className="p-4 rounded-xl bg-surface border border-limeAccent/30 space-y-2 text-xs sm:text-sm">
                <div className="font-heading font-bold text-limeAccent">Public Visibility Elements:</div>
                <ul className="list-disc pl-5 space-y-1 text-textMuted">
                  <li>Product names, websites, tags, and cumulative bid amounts displayed on the public leaderboard.</li>
                  <li>Approved creator clips and social reviews shared as part of verified brand campaign showcases.</li>
                  <li>Creator username, verified platform badges, and primary niche displayed on creator cards.</li>
                </ul>
              </div>
              <p>
                Personal contact details, email addresses, and private payout credentials are never published on the public interface.
              </p>
            </section>

            {/* Section 5 */}
            <section id="third-party-sharing" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                5. Third-Party Services & Processors
              </h2>
              <p>
                We do not sell, rent, or trade your personal data. We disclose information only to trusted third-party service providers who assist us in operating our protocol under strict confidentiality agreements:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-textMain">Payment Processors:</strong> Dodo Payments, Stripe, and decentralized blockchain networks for processing card payments, handling deposits, and executing creator withdrawals.
                </li>
                <li>
                  <strong className="text-textMain">Authentication & Infrastructure:</strong> NextAuth, Supabase / PostgreSQL cloud databases, and hosting infrastructure (e.g. Vercel) for secure session management and data persistence.
                </li>
                <li>
                  <strong className="text-textMain">Legal & Regulatory Compliance:</strong> We may disclose information if required to comply with a valid court order, law enforcement request, or applicable legal obligation.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="cookies-storage" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                6. Cookies & Local Storage
              </h2>
              <p>
                We utilize essential cookies and browser local storage (<code>localStorage</code>) to maintain your login session, persist UI filter preferences (such as selected campaign niche categories or leaderboard timeframes), and secure bid interactions.
              </p>
              <p>
                We do not use invasive third-party cross-site advertising trackers or sell your browsing history to advertising data brokers.
              </p>
            </section>

            {/* Section 7 */}
            <section id="security" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3 flex items-center justify-between">
                <span>7. Data Security & Storage</span>
                <ShieldCheck className="w-5 h-5 text-emeraldAccent" />
              </h2>
              <p>
                We implement industry-standard technical and organizational security measures to protect your personal information against unauthorized access, loss, alteration, or disclosure:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-xl bg-surface border border-borderMuted">
                  <div className="font-heading font-bold text-textMain mb-1">TLS / HTTPS Encryption</div>
                  <p className="text-textMuted">All data in transit is encrypted using modern TLS cryptographic protocols.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface border border-borderMuted">
                  <div className="font-heading font-bold text-textMain mb-1">Encrypted Storage</div>
                  <p className="text-textMuted">User credentials and database records are encrypted at rest with strict IAM controls.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface border border-borderMuted">
                  <div className="font-heading font-bold text-textMain mb-1">Automated Audits</div>
                  <p className="text-textMuted">Continuous validation routines monitor for unauthorized submissions and API tampering.</p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="retention" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                8. Data Retention & Deletion Rights
              </h2>
              <p>
                We retain your personal information for as long as your account remains active or as required to fulfill the purposes set out in this policy.
              </p>
              <p>
                If you request account deletion, we will purge your personally identifiable details within thirty (30) days, except for immutable public blockchain transactions, historical payment audit trails, and records legally required for tax compliance.
              </p>
            </section>

            {/* Section 9 */}
            <section id="user-rights" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                9. Your Privacy Rights (GDPR & CCPA)
              </h2>
              <p>
                Depending on your geographical location (including the European Economic Area, UK, and California), you possess specific privacy rights:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-textMain">Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong className="text-textMain">Right to Rectification:</strong> Request correction of inaccurate or incomplete information.</li>
                <li><strong className="text-textMain">Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request the permanent deletion of your account and personal data.</li>
                <li><strong className="text-textMain">Right to Portability:</strong> Obtain your data in a structured, machine-readable format.</li>
                <li><strong className="text-textMain">Right to Non-Discrimination:</strong> We will never deny services, charge different prices, or provide lesser service quality for exercising your privacy rights.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section id="children" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                10. Children&apos;s Privacy
              </h2>
              <p>
                Azyra is not directed to individuals under the age of 18 (or under the age of legal majority in your country of residence). We do not knowingly collect personal information from minors. If we become aware that a child has provided us with personal data, we will immediately delete such information.
              </p>
            </section>

            {/* Section 11 */}
            <section id="changes" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3 flex items-center justify-between">
                <span>11. Updates to this Policy</span>
                <Bell className="w-5 h-5 text-limeAccent" />
              </h2>
              <p>
                We may periodically update this Privacy Policy to reflect platform enhancements or changes in legal regulations. When material changes are made, we will notify you by updating the &quot;Last Updated&quot; timestamp at the top of this document or posting a prominent banner on the platform.
              </p>
            </section>

            {/* Section 12 */}
            <section id="contact" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                12. Privacy Inquiries & Data Protection
              </h2>
              <p>
                To exercise any of your statutory rights or ask questions regarding this policy, please reach out to our Data Protection Officer:
              </p>
              <div className="p-4 rounded-xl bg-surface border border-borderMuted space-y-2">
                <p className="text-textMain font-heading font-bold">AZYRA Data Protection Officer</p>
                <p className="text-xs font-mono text-textMuted">Email: <a href="mailto:privacy@azyra.app" className="text-limeAccent underline underline-offset-2">privacy@azyra.app</a></p>
                <p className="text-xs font-mono text-textMuted">Inquiries: <a href="mailto:support@azyra.app" className="text-limeAccent underline underline-offset-2">support@azyra.app</a></p>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-borderMuted bg-canvas/90 py-10 px-4 text-xs text-textMuted mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <AzyraLogo size="sm" />
            <div>
              <p className="text-[11px] text-textMuted">Financial Product Discovery & Creator Bounty Protocol</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-textMuted">
            <Link href="/" className="hover:text-limeAccent transition">
              Leaderboard
            </Link>
            <Link href="/campaigns" className="hover:text-emeraldAccent transition">
              Creator Campaigns
            </Link>
            <Link href="/terms" className="hover:text-textMain transition">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-limeAccent font-medium transition">
              Privacy Policy
            </Link>
          </div>

          <div className="text-right text-[11px] text-textMuted font-mono">
            © 2026 Azyra. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
