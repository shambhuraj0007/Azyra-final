import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import AzyraLogo from '../../components/AzyraLogo';
import { 
  ShieldCheck, 
  FileText, 
  Scale, 
  AlertTriangle, 
  Coins, 
  CheckCircle2, 
  ArrowRight, 
  Lock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service • AZYRA',
  description: 'Terms of Service governing the use of the Azyra Financial Leaderboard and Creator Bounty Marketplace.',
};

export default function TermsPage() {
  const lastUpdated = 'October 24, 2026';

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'protocol-overview', title: '2. Protocol & Marketplace Overview' },
    { id: 'accounts', title: '3. User Accounts & Eligibility' },
    { id: 'leaderboard-rules', title: '4. Financial Leaderboard & Bidding Rules' },
    { id: 'creator-campaigns', title: '5. Creator Bounty Campaigns & Escrow' },
    { id: 'content-guidelines', title: '6. Content Submissions & Anti-Fraud Policy' },
    { id: 'payments-fees', title: '7. Payouts, Fees & Taxation' },
    { id: 'intellectual-property', title: '8. Intellectual Property & Brand Rights' },
    { id: 'disclaimers', title: '9. Disclaimers & Limitation of Liability' },
    { id: 'suspension', title: '10. Termination & Enforcement' },
    { id: 'governing-law', title: '11. Governing Law & Dispute Resolution' },
    { id: 'contact', title: '12. Contact & Notices' },
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
            <span className="text-textMain font-medium">Terms of Service</span>
          </div>

          {/* Quick tab switcher between Terms and Privacy */}
          <div className="inline-flex p-1 rounded-xl bg-surface border border-borderMuted text-xs font-heading font-medium">
            <span className="px-3.5 py-1.5 rounded-lg bg-surfaceElevated text-limeAccent font-bold border border-borderMuted shadow-sm flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              Terms of Service
            </span>
            <Link
              href="/privacy"
              className="px-3.5 py-1.5 rounded-lg text-textMuted hover:text-textMain transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Hero Header */}
        <div className="relative rounded-2xl bg-surface border border-borderMuted p-6 sm:p-10 mb-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-limeAccent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-limeAccent/10 border border-limeAccent/20 text-limeAccent font-mono text-xs font-semibold uppercase tracking-wider mb-4">
              <FileText className="w-3.5 h-3.5" />
              Legal Agreement & Protocol Rules
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-textMain tracking-tight">
              Azyra Terms of Service
            </h1>
            <p className="mt-4 text-sm sm:text-base text-textMuted leading-relaxed">
              These Terms of Service govern your access to and use of the Azyra protocol, financial product leaderboard, brand campaign bidding engine, and creator bounty reward system.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-textMuted">
              <span className="bg-canvas/80 px-2.5 py-1 rounded-md border border-borderMuted">
                Effective: October 2026
              </span>
              <span className="bg-canvas/80 px-2.5 py-1 rounded-md border border-borderMuted">
                Last Updated: {lastUpdated}
              </span>
              <span className="text-emeraldAccent font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Version 2.4 Active
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
                <FileText className="w-4 h-4 text-limeAccent" />
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
                  <div className="flex items-center gap-2 text-limeAccent font-heading font-bold mb-1">
                    <ShieldCheck className="w-4 h-4" /> Need assistance?
                  </div>
                  <p className="text-textMuted text-[11px] leading-relaxed">
                    Have questions regarding legal compliance or bounty terms? Contact our legal team at{' '}
                    <a href="mailto:legal@azyra.app" className="text-limeAccent underline underline-offset-2">
                      legal@azyra.app
                    </a>.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Body Prose */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-12 text-sm sm:text-base leading-relaxed text-textMuted">
            
            {/* Section 1 */}
            <section id="acceptance" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account, connecting a Web3 wallet, placing bids on the financial leaderboard, creating a brand campaign, or submitting creator content for bounties, you (&quot;User&quot;, &quot;you&quot;, or &quot;Creator/Brand&quot;) agree to be bound by these Terms of Service (&quot;Terms&quot;) and our <Link href="/privacy" className="text-limeAccent underline underline-offset-2 hover:opacity-80">Privacy Policy</Link>.
              </p>
              <p>
                If you do not agree to these Terms, you must not access or use Azyra. If you are entering into these Terms on behalf of a company, organization, or other legal entity, you represent and warrant that you have full legal authority to bind such entity.
              </p>
            </section>

            {/* Section 2 */}
            <section id="protocol-overview" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                2. Protocol & Marketplace Overview
              </h2>
              <p>
                Azyra operates a high-frequency financial discovery protocol and a verified two-sided bounty marketplace:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-textMain">Financial Discovery Leaderboard:</strong> An algorithmic ranking registry where tech products, startups, and protocols compete for prominence based on cumulative daily and all-time capital allocated.
                </li>
                <li>
                  <strong className="text-textMain">Creator Campaign Marketplace:</strong> A performance-driven platform where brands allocate escrowed reward pools for verified short-form content, video reviews, and social distribution across X (Twitter), YouTube, TikTok, and Instagram.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="accounts" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                3. User Accounts & Eligibility
              </h2>
              <p>
                To utilize certain features, including posting campaigns or claiming creator earnings, you must register for an account. You represent and warrant that:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-surface border border-borderMuted">
                  <h4 className="font-heading font-bold text-textMain text-sm mb-1">Age & Authority</h4>
                  <p className="text-xs text-textMuted">You are at least 18 years old or the age of legal majority in your jurisdiction, and legally competent to enter into binding contracts.</p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-borderMuted">
                  <h4 className="font-heading font-bold text-textMain text-sm mb-1">Account Accuracy</h4>
                  <p className="text-xs text-textMuted">All information submitted (including social media handles, payout accounts, and profile links) is truthful, accurate, and owned by you.</p>
                </div>
              </div>
              <p className="pt-2">
                You are solely responsible for maintaining the confidentiality of your account credentials and wallet keys. You are fully responsible for all activities that occur under your account.
              </p>
            </section>

            {/* Section 4 */}
            <section id="leaderboard-rules" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3 flex items-center justify-between">
                <span>4. Financial Leaderboard & Bidding Rules</span>
                <Coins className="w-5 h-5 text-limeAccent" />
              </h2>
              <p>
                The Azyra Leaderboard is an uncurated, capital-weighted discovery engine. The following strict rules govern all leaderboard bids:
              </p>
              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-xl bg-surface border border-limeAccent/30 space-y-2">
                  <span className="font-mono text-xs font-bold uppercase text-limeAccent bg-limeAccent/10 px-2 py-0.5 rounded">
                    Non-Refundable Capital
                  </span>
                  <p className="text-xs sm:text-sm text-textMain">
                    All bids placed to claim ranks or outbid other listings are <strong>strictly non-refundable</strong> once confirmed and settled through the payment provider or blockchain transaction.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-borderMuted space-y-2">
                  <span className="font-mono text-xs font-bold uppercase text-textMain bg-canvas px-2 py-0.5 rounded border border-borderMuted">
                    Tie-Breaking Protocol
                  </span>
                  <p className="text-xs sm:text-sm text-textMuted">
                    When two or more products hold equal cumulative bid capital, ranking priority is awarded strictly in order of initial transaction timestamp (earliest verified block/payment timestamp wins).
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-borderMuted space-y-2">
                  <span className="font-mono text-xs font-bold uppercase text-textMain bg-canvas px-2 py-0.5 rounded border border-borderMuted">
                    No Shill or Fraudulent Bidding
                  </span>
                  <p className="text-xs sm:text-sm text-textMuted">
                    Using stolen payment instruments, automated chargeback schemes, or fraudulent credit cards will result in permanent blacklisting, removal from rankings, and referral to law enforcement.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="creator-campaigns" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                5. Creator Bounty Campaigns & Escrow
              </h2>
              <p>
                Brands may sponsor creator campaigns by depositing funds into campaign escrow budgets.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-textMain">Campaign Briefs & Rules:</strong> Brands define the target niche, format requirements, key product talking points, and payout tier (e.g., CPM per 1,000 views, or fixed rewards per submission).
                </li>
                <li>
                  <strong className="text-textMain">Escrow Allocation:</strong> Once a campaign is funded, the budget is held in reserve to compensate verified creators. Unclaimed budget remains subject to the campaign expiry terms selected by the brand.
                </li>
                <li>
                  <strong className="text-textMain">Approval Workflow:</strong> Content submissions are subjected to automated metric verification and manual administrative compliance checks before funds are credited to creator balances.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="content-guidelines" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3 flex items-center justify-between">
                <span>6. Content Submissions & Anti-Fraud Policy</span>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </h2>
              
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm space-y-2">
                <div className="font-heading font-bold flex items-center gap-2 text-amber-300">
                  <AlertTriangle className="w-4 h-4" /> Zero Tolerance for Synthetic Traffic
                </div>
                <p>
                  Any submission involving bot views, engagement pods, paid click farms, spoofed analytics, or manipulated screenshots will result in immediate disqualification, forfeiture of unpaid earnings, and permanent platform ban.
                </p>
              </div>

              <p className="pt-2">Creators must strictly comply with the following standards:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-textMain">FTC & Regulatory Disclosures:</strong> Creators must clearly and conspicuously disclose the sponsored/incentivized nature of their post (e.g. including <code>#ad</code>, <code>#sponsored</code>, or <code>#azyrapartner</code>) in accordance with FTC guidelines and regional advertising laws.
                </li>
                <li>
                  <strong className="text-textMain">Authentic Ownership:</strong> You may only submit content published from social media accounts verified under your Azyra creator profile.
                </li>
                <li>
                  <strong className="text-textMain">Longevity Requirement:</strong> Submitted videos and posts must remain publicly accessible on the designated platform for a minimum of 90 days. Deleting posts prematurely forfeits future campaign eligibility.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="payments-fees" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                7. Payouts, Fees & Taxation
              </h2>
              <p>
                Approved campaign earnings are credited to the creator&apos;s platform balance in USD.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-textMain">Withdrawals:</strong> Creators may request payouts via supported payment rails (e.g., Dodo Payments, Stripe Connect, Solana/USDC crypto rails) subject to minimum withdrawal limits and standard settlement intervals.
                </li>
                <li>
                  <strong className="text-textMain">Platform Protocol Fees:</strong> Azyra deducts transparent platform transaction fees (if applicable) at the time of campaign funding or disbursement as disclosed during checkout.
                </li>
                <li>
                  <strong className="text-textMain">Taxes:</strong> Users are solely responsible for determining, reporting, and paying any and all applicable income taxes, VAT, sales tax, or social contributions arising from their leaderboard expenditures or bounty earnings.
                </li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="intellectual-property" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                8. Intellectual Property & Brand Rights
              </h2>
              <p>
                <strong>Brand Trademarks:</strong> Brands retain all rights in their product logos, trade names, screenshots, and marketing guidelines provided for campaigns. Brands grant Azyra and verified creators a non-exclusive, worldwide license to display their trademarks solely for running and fulfilling campaigns and leaderboard displays.
              </p>
              <p>
                <strong>Creator Content License:</strong> By submitting content under a campaign bounty, the Creator grants the sponsoring Brand and Azyra a non-exclusive, royalty-free, perpetual license to repost, embed, cite, and feature the content across marketing channels, landing pages, and social media.
              </p>
            </section>

            {/* Section 9 */}
            <section id="disclaimers" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                9. Disclaimers & Limitation of Liability
              </h2>
              <p className="uppercase text-xs tracking-wider font-mono text-textMuted bg-surface p-4 rounded-xl border border-borderMuted leading-relaxed">
                THE AZYRA PROTOCOL AND PLATFORM ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED. AZYRA MAKES NO WARRANTY THAT RANKING ON THE LEADERBOARD OR LAUNCHING CREATOR BOUNTIES WILL GENERATE ANY SPECIFIC LEVEL OF REVENUE, TRAFFIC, CUSTOMERS, OR VIRALITY.
              </p>
              <p>
                IN NO EVENT SHALL AZYRA, ITS FOUNDERS, EMPLOYEES, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
              </p>
            </section>

            {/* Section 10 */}
            <section id="suspension" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                10. Termination & Enforcement
              </h2>
              <p>
                Azyra reserves the right to suspend or terminate your account, confiscate ill-gotten bounty balances, and remove leaderboard listings immediately without prior notice if we detect fraudulent activity, spam, copyright infringement, or violation of these Terms.
              </p>
            </section>

            {/* Section 11 */}
            <section id="governing-law" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                11. Governing Law & Dispute Resolution
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Azyra operates, without regard to its conflict of law provisions. Any dispute, claim, or controversy arising out of or relating to these Terms shall be resolved by binding arbitration conducted on an individual basis.
              </p>
            </section>

            {/* Section 12 */}
            <section id="contact" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain border-b border-borderMuted pb-3">
                12. Contact & Notices
              </h2>
              <p>
                If you have questions, notices, or inquiries regarding these Terms of Service, please reach out to our team:
              </p>
              <div className="p-4 rounded-xl bg-surface border border-borderMuted space-y-2">
                <p className="text-textMain font-heading font-bold">AZYRA Protocol Legal Team</p>
                <p className="text-xs font-mono text-textMuted">Email: <a href="mailto:legal@azyra.app" className="text-limeAccent underline underline-offset-2">legal@azyra.app</a></p>
                <p className="text-xs font-mono text-textMuted">Support: <a href="mailto:support@azyra.app" className="text-limeAccent underline underline-offset-2">support@azyra.app</a></p>
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
            <Link href="/terms" className="text-limeAccent font-medium transition">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-textMain transition">
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
