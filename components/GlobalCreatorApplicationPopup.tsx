'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useCampaigns } from '../lib/CampaignContext';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function GlobalCreatorApplicationPopup() {
  const { currentUser } = useCampaigns();
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if logged in, role is creator, application is completely unsubmitted (none),
    // and they are not currently on the apply page or login page
    if (
      currentUser.isLoggedIn &&
      currentUser.role === 'creator' &&
      currentUser.creatorStatus === 'none' &&
      pathname !== '/apply' &&
      pathname !== '/login'
    ) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [currentUser, pathname]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl border border-borderMuted">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full bg-surface border border-borderMuted p-4 shadow-xl">
          <Sparkles className="h-8 w-8 text-limeAccent" />
        </div>
        
        <div className="mt-6 text-center">
          <h3 className="font-heading text-xl font-bold text-textPrimary">
            Complete Your Creator Application
          </h3>
          <p className="mt-2 text-sm text-textMuted">
            You are one step away from joining premium campaigns. Fill out your creator application to get verified and start earning!
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => {
              setIsVisible(false);
              router.push('/apply');
            }}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-limeAccent px-4 py-3 font-heading text-sm font-bold text-bg transition hover:opacity-90"
          >
            Start Application
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          
          <button
            onClick={() => setIsVisible(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-transparent px-4 py-3 font-heading text-sm font-semibold text-textMuted transition hover:bg-surfaceElevated hover:text-textPrimary"
          >
            I'll do it later
          </button>
        </div>
      </div>
    </div>
  );
}
