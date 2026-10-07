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
    <section id="how-it-works" className="py-12 border-t border-zinc-800/80">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/20 mb-3">
          <Zap className="h-3.5 w-3.5" />
          <span>The Protocol Rules</span>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
          How the Leaderboard Operates
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Built on radical transparency for Azyra. Pure financial bidding, zero editorial curation, zero gatekeepers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/90"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-amber-400 font-bold border border-zinc-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                      Rule {item.step}
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-4 rounded-xl bg-zinc-950/80 p-3 border border-zinc-800/80 text-[11px] font-mono text-amber-300/90 flex items-center gap-2">
                <span className="text-zinc-500 font-sans font-semibold">Example:</span>
                <span>{item.example}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
