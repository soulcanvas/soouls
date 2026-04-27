'use client';

import { useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { HOME_THEME_STORAGE_KEY, applyHomeTheme } from '../hooks/use-home-theme';
import { trpc } from '../utils/trpc';

export function UiThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const shouldUseHomeTheme = pathname.startsWith('/home') || pathname.startsWith('/onboarding');

  const { data } = trpc.private.home.getSettings.useQuery(undefined, {
    enabled: shouldUseHomeTheme && !!isSignedIn,
  });

  useEffect(() => {
    if (!shouldUseHomeTheme || typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(HOME_THEME_STORAGE_KEY);
      if (!raw) {
        applyHomeTheme();
        return;
      }

      applyHomeTheme(JSON.parse(raw) as { themeMode: 'dark' | 'light'; accentTheme: HomeAccent });
    } catch {
      applyHomeTheme();
    }
  }, [shouldUseHomeTheme]);

  useEffect(() => {
    if (!shouldUseHomeTheme || !data || typeof window === 'undefined') return;

    if (pathname.startsWith('/onboarding')) {
      const local = window.localStorage.getItem(HOME_THEME_STORAGE_KEY);
      if (local) {
        try {
          applyHomeTheme(
            JSON.parse(local) as { themeMode: 'dark' | 'light'; accentTheme: HomeAccent },
          );
          return;
        } catch {
          // Fall back to server settings when the local preview cannot be parsed.
        }
      }
    }

    applyHomeTheme(data);
    window.localStorage.setItem(
      HOME_THEME_STORAGE_KEY,
      JSON.stringify({
        themeMode: data.themeMode,
        accentTheme: data.accentTheme,
      }),
    );
  }, [data, shouldUseHomeTheme]);

  return <>{children}</>;
}

type HomeAccent = 'orange' | 'yellow' | 'green' | 'purple';
