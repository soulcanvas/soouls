'use client';

import { useAuth, useClerk } from '@clerk/nextjs';
import { Loader2, RefreshCw } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Viewer } from '../lib/api';
import { api } from '../lib/api';
import Sidebar from './Sidebar';

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

/**
 * When the backend returns 401 (unauthorized), sign the user out and redirect to /sign-in.
 * Non-admin users can never stay on the dashboard.
 */
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
      // Check if it's an authorization rejection from the backend
      if (
        message.includes('not been invited') ||
        message.includes('revoked') ||
        message.includes('Unauthorized') ||
        message.includes('permission')
      ) {
        setIsUnauthorized(true);
      } else {
        setError(message);
      }
    }
  }, []);

  // Wait for Clerk to load, then check auth status
  useEffect(() => {
    if (!authLoaded || isSignInPage) return;

    // Not signed in via Clerk → redirect to sign-in (no sign-out needed)
    if (!isSignedIn) {
      router.replace('/sign-in');
      return;
    }

    // Signed in → fetch viewer from backend
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

  // Auto-dismiss flash
  useEffect(() => {
    if (!flash) return;
    const timeout = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(timeout);
  }, [flash]);

  // Sign-in page: just render children, no auth needed
  if (isSignInPage) {
    return <>{children}</>;
  }

  // Still waiting for Clerk or viewer data
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

  // Backend explicitly rejected — sign out and redirect
  if (isUnauthorized) {
    return <UnauthorizedRedirect />;
  }

  // Network/server error — show error with retry (don't sign out)
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
            onClick={() => {
              setError(null);
              setLoading(true);
              void loadViewer().finally(() => setLoading(false));
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/20"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <ShellContext.Provider value={{ viewer, flash, setFlash, refreshViewer: loadViewer }}>
      <div className="flex min-h-screen">
        <Sidebar viewer={viewer} />
        <main className="ml-[260px] flex-1 overflow-y-auto">
          {/* Flash notification */}
          {flash && (
            <div className="fixed right-6 top-6 z-50 animate-fade-in rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm text-emerald-200 shadow-lg shadow-emerald-500/10 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {flash}
              </div>
            </div>
          )}
          <div className="p-8">{children}</div>
        </main>
      </div>
    </ShellContext.Provider>
  );
}
