'use client';

import { useAuth } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NetworkMode } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { createIDBPersister, shouldPersistQuery } from '../utils/cache/persistence';
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
  const idbPersister = useMemo(() => createIDBPersister(true), []);

  useEffect(() => {
    if (!idbPersister) return;

    let cancelled = false;

    const restore = async () => {
      try {
        const persistedClient = await idbPersister.restoreClient();
        if (cancelled || !persistedClient) return;

        const client = persistedClient as {
          queries?: Array<{ queryKey: unknown[]; state: { data: unknown } }>;
        };
        const queries = client.queries || [];
        for (const query of queries) {
          // Only restore if not already fetched (avoid race condition)
          if (!queryClient.getQueryData(query.queryKey)) {
            queryClient.setQueryData(query.queryKey, query.state.data);
          }
        }
      } catch (e) {
        console.warn('[Cache] Failed to restore cache:', e);
      }
    };

    restore();

    const persist = async () => {
      if (cancelled) return;

      try {
        const allQueries = queryClient.getQueryCache().getAll();
        const persistable = allQueries
          .filter((q) => shouldPersistQuery([...q.queryKey]) && q.state?.data !== undefined)
          .map((q) => ({
            queryKey: [...q.queryKey],
            state: { data: q.state.data, status: q.state.status },
          }));

        if (persistable.length > 0) {
          await idbPersister.persistClient({ queries: persistable, clientState: {} } as never);
        }
      } catch (e) {
        console.warn('[Cache] Failed to persist cache:', e);
      }
    };

    const interval = setInterval(persist, 30000);
    window.addEventListener('beforeunload', persist);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('beforeunload', persist);
    };
  }, [queryClient, idbPersister]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

export async function clearQueryCache(): Promise<void> {
  const { clearPersistedCache } = await import('../utils/cache/persistence');
  await clearPersistedCache();
}
