import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import { del, get, set } from 'idb-keyval';

const CACHE_VERSION = 1;
const STORE_KEY = 'soouls-query-cache';
const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export interface CacheConfig {
  maxAge?: number;
  shouldDehydrate?: (queryKey: unknown[]) => boolean;
}

export function createIDBPersister(enabled = true): Persister | undefined {
  if (!enabled || typeof window === 'undefined') return undefined;

  return {
    persistClient: async (client: PersistedClient) => {
      const serialized = JSON.stringify({
        version: CACHE_VERSION,
        data: client,
        timestamp: Date.now(),
      });
      await set(STORE_KEY, serialized);
    },
    restoreClient: async () => {
      const serialized = await get<string>(STORE_KEY);
      if (!serialized) return undefined;

      try {
        const parsed = JSON.parse(serialized);
        if (parsed.version !== CACHE_VERSION) {
          await del(STORE_KEY);
          return undefined;
        }

        const maxAge = parsed.timestamp + DEFAULT_MAX_AGE;
        if (Date.now() > maxAge) {
          await del(STORE_KEY);
          return undefined;
        }

        return parsed.data as PersistedClient;
      } catch {
        await del(STORE_KEY);
        return undefined;
      }
    },
    removeClient: async () => {
      await del(STORE_KEY);
    },
  };
}

export function shouldPersistQuery(queryKey: unknown[]): boolean {
  const [namespace, ...rest] = queryKey;

  if (typeof namespace !== 'string') return false;

  const persistableNamespaces = ['private.entries', 'private.messaging'];

  if (rest.length === 0) {
    return persistableNamespaces.includes(namespace);
  }

  if (
    namespace === 'private.entries' &&
    ['getGalaxy', 'getAll', 'getOne'].includes(rest[0] as string)
  ) {
    return true;
  }

  if (namespace === 'private.messaging' && rest[0] === 'getCenter') {
    return true;
  }

  return persistableNamespaces.includes(namespace);
}

export async function clearPersistedCache(): Promise<void> {
  await del(STORE_KEY);
}

export async function getCacheSize(): Promise<number> {
  if (typeof window === 'undefined') return 0;

  const serialized = await get<string>(STORE_KEY);
  if (!serialized) return 0;

  return serialized.length;
}

export function setupCacheSync(): () => void {
  if (typeof window === 'undefined') return () => {};

  const channel = new BroadcastChannel('soouls-cache-sync');

  channel.onmessage = (event) => {
    if (event.data?.type === 'CACHE_INVALIDATED') {
      window.dispatchEvent(
        new CustomEvent('cache-invalidated', {
          detail: event.data.queryKey,
        }),
      );
    }
  };

  return () => {
    channel.close();
  };
}

export function invalidateCacheRemotely(queryKey: unknown[]): void {
  if (typeof window === 'undefined') return;

  const channel = new BroadcastChannel('soouls-cache-sync');
  channel.postMessage({ type: 'CACHE_INVALIDATED', queryKey });
  channel.close();
}
