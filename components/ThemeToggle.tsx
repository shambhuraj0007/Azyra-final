'use client';

import { useTheme } from '../lib/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-8 w-8 rounded-xl bg-surfaceElevated border border-borderMuted ${className}`} />
    );
  }

  const isLight = resolvedTheme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      className={`group relative flex h-8 w-8 items-center justify-center rounded-xl bg-surfaceElevated border border-borderMuted text-textMuted hover:text-textMain hover:border-limeAccent/50 transition-all active:scale-95 cursor-pointer shadow-sm ${className}`}
    >
      {isLight ? (
        <Sun className="h-4 w-4 text-amber-500 transition-transform group-hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-limeAccent transition-transform group-hover:-rotate-12" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

