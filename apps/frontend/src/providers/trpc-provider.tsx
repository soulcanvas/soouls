'use client';

import { useAuth } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NetworkMode } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { getTRPCClient, trpc } from '../utils/trpc';

const QUERY_OPTIONS = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
  retry: 1,
  networkMode: 'offlineFirst' as NetworkMode,
};

const MUTATION_OPTIONS = {
  networkMode: 'offlineFirst' as NetworkMode,
  retry: 1,
};

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: QUERY_OPTIONS,
          mutations: MUTATION_OPTIONS,
        },
      }),
  );
  const { getToken } = useAuth();

  const trpcClient = useMemo(() => getTRPCClient(getToken), [getToken]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

const CACHE_KEY = 'soulcanvas-query-cache';

export function PersistedTRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            ...QUERY_OPTIONS,
            gcTime: 7 * 24 * 60 * 60 * 1000,
          },
          mutations: MUTATION_OPTIONS,
        },
      }),
  );

  const { getToken } = useAuth();
  const trpcClient = useMemo(() => getTRPCClient(getToken), [getToken]);

  useMemo(() => {
    if (typeof window === 'undefined') return;

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { queries, timestamp } = JSON.parse(cached);
        const maxAge = 7 * 24 * 60 * 60 * 1000;

        if (Date.now() - timestamp < maxAge && Array.isArray(queries)) {
          for (const query of queries) {
            if (query?.state?.data) {
              queryClient.setQueryData(query.queryKey, query.state.data);
            }
          }
        }
      }
    } catch (e) {
      console.warn('[Cache] Failed to restore cache:', e);
    }

    const persist = () => {
      try {
        const queries = queryClient.getQueryCache().getAll();
        const serializable = queries
          .filter((q) => q.state.data !== undefined)
          .map((q) => ({
            queryKey: q.queryKey,
            state: {
              data: q.state.data,
              status: q.state.status,
            },
          }));

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ queries: serializable, timestamp: Date.now() }),
        );
      } catch (e) {
        console.warn('[Cache] Failed to persist cache:', e);
      }
    };

    const interval = setInterval(persist, 30000);
    window.addEventListener('beforeunload', persist);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', persist);
    };
  }, [queryClient]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

export function clearQueryCache(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEY);
  }
}
