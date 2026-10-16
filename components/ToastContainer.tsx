'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Lock,
  X,
  ArrowRight,
} from 'lucide-react';
import { toast, ToastItem, ToastType } from '@/lib/toast';

const TOAST_CONFIG: Record<
  ToastType,
  {
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    borderColor: string;
    glowColor: string;
    progressBarBg: string;
    badgeText: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    accentColor: 'text-[#00F59B]',
    borderColor: 'border-[#00F59B]/30',
    glowColor: 'shadow-[0_8px_32px_rgba(0,245,155,0.18)]',
    progressBarBg: 'bg-[#00F59B]',
    badgeText: 'Success',
  },
  error: {
    icon: AlertCircle,
    accentColor: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    glowColor: 'shadow-[0_8px_32px_rgba(244,63,94,0.2)]',
    progressBarBg: 'bg-rose-500',
    badgeText: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-[0_8px_32px_rgba(245,158,11,0.2)]',
    progressBarBg: 'bg-amber-400',
    badgeText: 'Warning',
  },
  info: {
    icon: Info,
    accentColor: 'text-sky-400',
    borderColor: 'border-sky-500/30',
    glowColor: 'shadow-[0_8px_32px_rgba(56,189,248,0.2)]',
    progressBarBg: 'bg-sky-400',
    badgeText: 'Notice',
  },
  auth: {
    icon: Lock,
    accentColor: 'text-limeAccent',
    borderColor: 'border-limeAccent/40',
    glowColor: 'shadow-[0_8px_32px_rgba(212,255,0,0.25)]',
    progressBarBg: 'bg-limeAccent',
    badgeText: 'Auth Required',
  },
};

function ToastCard({ item }: { item: ToastItem }) {
  const config = TOAST_CONFIG[item.type] || TOAST_CONFIG.info;
  const Icon = config.icon;
  const duration = item.duration || 4000;

  return (
    <div
      role="alert"
      className={`relative w-full max-w-sm overflow-hidden rounded-2xl border ${config.borderColor} bg-[#0D1214]/95 p-4 backdrop-blur-2xl transition-all duration-300 hover:scale-[1.01] ${config.glowColor}`}
    >
      <div className="flex items-start gap-3">
        {/* Animated Icon Container */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/5 ${config.accentColor}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-white/[0.05] ${config.accentColor}`}
            >
              {config.badgeText}
            </span>
          </div>
          <h4 className="text-sm font-heading font-bold text-white tracking-tight leading-snug">
            {item.title}
          </h4>
          {item.message && (
            <p className="mt-1 text-xs text-[#9DA8AF] leading-relaxed break-words font-sans">
              {item.message}
            </p>
          )}

          {/* Action Button */}
          {item.action && (
            <button
              onClick={() => {
                item.action?.onClick();
                toast.dismiss(item.id);
              }}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 px-2.5 py-1 text-xs font-heading font-semibold text-white transition active:scale-95"
            >
              <span>{item.action.label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-limeAccent" />
            </button>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => toast.dismiss(item.id)}
          className="shrink-0 rounded-lg p-1 text-[#6B757D] hover:bg-white/[0.06] hover:text-white transition"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.06]">
          <div
            className={`h-full ${config.progressBarBg} opacity-80`}
            style={{
              animation: `toastProgress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((updated) => {
      setToasts(updated);
    });
    return () => unsubscribe();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes toastProgress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
      <div
        aria-live="polite"
        className="pointer-events-none fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-sm:inset-x-4 max-sm:top-4 max-sm:items-center pointer-events-auto"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-200">
            <ToastCard item={t} />
          </div>
        ))}
      </div>
    </>
  );
}
