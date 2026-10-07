'use client';

import { useState, useEffect } from 'react';
import { Flame, ArrowUpRight, Zap } from 'lucide-react';
import { BidActivity } from '../lib/types';

interface ActivityTickerProps {
  activities: BidActivity[];
  onSelectRank: (rank: number) => void;
}

export default function ActivityTicker({ activities, onSelectRank }: ActivityTickerProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!activities || activities.length === 0) return null;

  const displayItems = [...activities, ...activities];

  const formatTime = (ts: number) => {
    if (!now) return 'Recently';
    const minutesAgo = Math.floor((now - ts) / (1000 * 60));
    if (minutesAgo < 1) return 'Just now';
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    return `${Math.floor(minutesAgo / 60)}h ago`;
  };

  return (
    <div className="relative border-y border-zinc-800/80 bg-zinc-950/60 overflow-hidden py-2 backdrop-blur-sm">
      {/* Edge gradient masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-zinc-950 to-transparent"></div>
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-zinc-950 to-transparent"></div>

      <div className="flex items-center">
        <div className="flex items-center gap-1.5 pl-4 pr-3 text-xs font-semibold uppercase tracking-wider text-amber-400 shrink-0 border-r border-zinc-800 mr-2 z-20 bg-zinc-950/90">
          <Zap className="h-3.5 w-3.5 text-amber-400 animate-pulse fill-amber-400" />
          <span>Live Bids</span>
        </div>

        <div className="flex overflow-hidden">
          <div className="animate-ticker flex items-center gap-6">
            {displayItems.map((item, index) => (
              <button
                key={`${item.id}-${index}`}
                onClick={() => onSelectRank(item.targetRank)}
                className="group inline-flex items-center gap-2 rounded-lg bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-300 ring-1 ring-zinc-800 transition hover:bg-zinc-800 hover:ring-amber-500/40"
              >
                <span className="font-semibold text-white group-hover:text-amber-400">
                  {item.productName}
                </span>
                <span className="text-zinc-500">•</span>
                <span className="font-mono font-medium text-emerald-400">
                  +${item.amount.toLocaleString()}
                </span>
                <span className="text-zinc-500">•</span>
                <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/10 px-1 py-0.5 text-[10px] font-bold text-amber-400">
                  Rank #{item.targetRank}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {formatTime(item.timestamp)}
                </span>
                <ArrowUpRight className="h-3 w-3 text-zinc-500 transition group-hover:text-amber-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
