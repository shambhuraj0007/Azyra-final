'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('azyra_theme') as Theme | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setThemeState(stored);
      } else {
        setThemeState('dark');
      }
    } catch {
      setThemeState('dark');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    const getSystemTheme = (): 'dark' | 'light' => {
      if (typeof window === 'undefined') return 'dark';
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    };

    const effective = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(effective);

    if (effective === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }

    try {
      localStorage.setItem('azyra_theme', theme);
    } catch {
      // ignore
    }

    // Listener for system preference changes when mode is 'system'
    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: light)');
      const listener = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'light' : 'dark';
        setResolvedTheme(newTheme);
        if (newTheme === 'light') {
          root.classList.remove('dark');
          root.classList.add('light');
        } else {
          root.classList.remove('light');
          root.classList.add('dark');
        }
      };
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

