'use client';

import { useAuth } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Viewer } from '../lib/api';
import { api } from '../lib/api';
import { DashboardShell } from './DashboardShell';

type ShellContextValue = {
  viewer: Viewer | null;
  flash: string | null;
  setFlash: (msg: string | null) => void;
  refreshViewer: () => Promise<void>;
};

const ShellContext = createContext<ShellContextValue>({
  viewer: null,
  flash: null,
  setFlash: () => {},
  refreshViewer: async () => {},
});

export function useShell() {
  return useContext(ShellContext);
}

function UnauthorizedRedirect() {
  const { signOut } = useClerk();
  const router = useRouter();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    void signOut().then(() => {
      router.replace('/sign-in');
    });
  }, [signOut, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#040814]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl" />
          <Loader2 className="relative h-10 w-10 animate-spin text-amber-300" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white">Access denied</p>
          <p className="mt-1 text-xs text-slate-500">Redirecting to sign-in…</p>
        </div>
      </div>
    </main>
  );
}

import { useClerk } from '@clerk/nextjs';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  const isSignInPage = pathname.startsWith('/sign-in');

  const loadViewer = useCallback(async () => {
    try {
      const me = await api<{ viewer: Viewer }>('/command-api/me');
      setViewer(me.viewer);
      setError(null);
      setIsUnauthorized(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load Command Center.';
      if (
        message.includes('not been invited') ||
        message.includes('revoked') ||
        message.includes('Unauthorized') ||
        message.includes('Unauthorized Entity') ||
        message.includes('Forbidden') ||
        message.includes('permission')
      ) {
        setIsUnauthorized(true);
      } else {
        setError(message);
      }
    }
  }, []);

  useEffect(() => {
    if (!authLoaded || isSignInPage) return;

    if (!isSignedIn) {
      router.replace('/sign-in');
      return;
    }

    let cancelled = false;
    async function boot() {
      setLoading(true);
      await loadViewer();
      if (!cancelled) setLoading(false);
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, [authLoaded, isSignedIn, isSignInPage, loadViewer, router]);

  useEffect(() => {
    if (!flash) return;
    const timeout = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(timeout);
  }, [flash]);

  if (isSignInPage) {
    return <>{children}</>;
  }

  if (!authLoaded || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#040814]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl" />
            <Loader2 className="relative h-10 w-10 animate-spin text-amber-300" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white">Loading Command Center</p>
            <p className="mt-1 text-xs text-slate-500">Authenticating & fetching telemetry…</p>
          </div>
        </div>
      </main>
    );
  }

  if (isUnauthorized) {
    return <UnauthorizedRedirect />;
  }

  if (error || !viewer) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#040814] px-6">
        <div className="max-w-md rounded-2xl border border-rose-400/20 bg-rose-400/5 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-400/10">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-lg font-medium text-rose-200">{error ?? 'Unable to connect'}</p>
          <p className="mt-2 text-sm text-slate-500">
            Make sure the backend server is running and try again.
          </p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoading(true);
              void loadViewer().finally(() => setLoading(false));
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/20"
          >
            <Loader2 className="h-4 w-4" />
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <ShellContext.Provider value={{ viewer, flash, setFlash, refreshViewer: loadViewer }}>
      <DashboardShell viewer={viewer} />
    </ShellContext.Provider>
  );
}
