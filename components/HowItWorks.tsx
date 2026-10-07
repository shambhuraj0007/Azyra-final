import { DollarSign, ArrowUpRight, Flame, Scale, Clock, ShieldCheck, Zap } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Pure Financial Hierarchy',
      icon: DollarSign,
      color: 'amber',
      description:
        'Rank is determined strictly by the total amount of money a product has contributed. The highest payer sits at #1, the second highest at #2, and so down the list. No opaque algorithmic black boxes or vote manipulation.',
      example: '#1 spot = $14,850 • #2 spot = $11,420 • #3 spot = $9,800',
    },
    {
      step: '02',
      title: 'The "Claim This Rank" Mechanic',
      icon: ArrowUpRight,
      color: 'emerald',
      description:
        'Every entry on the leaderboard displays a direct call-to-action showing the exact bid required to overtake it. To claim #1, you must outbid the top spot by at least $5. When bumping an existing listing, you only pay the difference!',
      example: 'To overtake $1,000 spot: Pay $1,001. If you already spent $400, you pay only +$601!',
    },
    {
      step: '03',
      title: 'Time-Based Boards',
      icon: Clock,
      color: 'sky',
      description:
        'The All-Time Board tracks cumulative spend over the life of the project—permanent placement that never expires unless outbid. The Daily Board resets every 24 hours UTC, giving emerging launches a clean slate to win the day.',
      example: 'All-Time = Cumulative legacy score. Daily = 24-hour UTC sprint.',
    },
    {
      step: '04',
      title: 'Tie-Breaker Rule',
      icon: Scale,
      color: 'purple',
      description:
        'If two different products happen to possess the exact same total bid amount down to the penny, the older listing retains the higher rank. Seniority rewards early conviction.',
      example: 'Product A (March 1st, $500) ranks above Product B (March 5th, $500).',
    },
  ];

  return (
    <section id="how-it-works" className="py-12 border-t border-borderMuted">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-surfaceElevated px-3 py-1 text-xs font-mono font-bold text-limeAccent border border-borderMuted mb-3">
          <Zap className="h-3.5 w-3.5 text-limeAccent" />
          <span>The Protocol Rules</span>
        </div>
        <h2 className="text-3xl font-heading font-bold text-textMain tracking-tight sm:text-4xl">
          How the Leaderboard Operates
        </h2>
        <p className="mt-2 text-sm text-textMuted">
          Built on radical transparency for Azyra. Pure financial bidding, zero editorial curation, zero gatekeepers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="relative rounded-xl border border-borderMuted bg-surface p-6 backdrop-blur-sm transition-all hover:border-limeAccent/40 hover:bg-surfaceElevated/70"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surfaceElevated text-limeAccent font-bold border border-borderMuted">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-textMuted">
                      Rule {item.step}
                    </span>
                    <h3 className="text-base font-heading font-bold text-textMain">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs text-textMuted leading-relaxed">
                {item.description}
              </p>

              <div className="mt-4 rounded-lg bg-canvas p-3 border border-borderMuted text-[11px] font-mono text-limeAccent flex items-center gap-2">
                <span className="text-textMuted font-sans font-medium">Example:</span>
                <span>{item.example}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
