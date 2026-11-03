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
    <div className="relative border-y border-borderMuted bg-surface/80 overflow-hidden py-2 backdrop-blur-sm">
      {/* Edge gradient masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-canvas to-transparent"></div>
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-canvas to-transparent"></div>

      <div className="flex items-center">
        <div className="flex items-center gap-1.5 pl-4 pr-3 text-xs font-semibold uppercase tracking-wider text-limeAccent shrink-0 border-r border-borderMuted mr-2 z-20 bg-surface/90">
          <Zap className="h-3.5 w-3.5 text-limeAccent animate-pulse fill-limeAccent" />
          <span>Live Bids</span>
        </div>

        <div className="flex overflow-hidden">
          <div className="animate-ticker flex items-center gap-6">
            {displayItems.map((item, index) => (
              <button
                key={`${item.id}-${index}`}
                onClick={() => onSelectRank(item.targetRank)}
                className="group inline-flex items-center gap-2 rounded-md bg-surfaceElevated px-2.5 py-1 text-xs text-textMuted border border-borderMuted transition hover:bg-surface hover:border-borderStrong cursor-pointer"
              >
                <span className="font-semibold text-textMain group-hover:text-limeAccent">
                  {item.productName}
                </span>
                <span className="text-textMuted">•</span>
                <span className="font-mono font-medium text-emeraldAccent">
                  +${item.amount.toLocaleString()}
                </span>
                <span className="text-textMuted">•</span>
                <span className="inline-flex items-center gap-0.5 rounded bg-limeAccent/10 px-1 py-0.5 text-[10px] font-bold text-limeAccent border border-limeAccent/20">
                  Rank #{item.targetRank}
                </span>
                <span className="text-[10px] text-textMuted">
                  {formatTime(item.timestamp)}
                </span>
                <ArrowUpRight className="h-3 w-3 text-textMuted transition group-hover:text-limeAccent" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
