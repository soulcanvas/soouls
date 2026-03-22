'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';

export function useApi() {
  const { getToken } = useAuth();

  const api = useCallback(
    async <T>(url: string, init?: RequestInit): Promise<T> => {
      const token = await getToken();

      const response = await fetch(url, {
        ...init,
        headers: {
          ...init?.headers,
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      const payload = (await response.json().catch(() => null)) as T | { message?: string } | null;

      if (!response.ok) {
        throw new Error(
          payload && typeof payload === 'object' && 'message' in payload && payload.message
            ? payload.message
            : `Request failed: ${url}`,
        );
      }

      return payload as T;
    },
    [getToken],
  );

  const apiFresh = useCallback(
    async <T>(url: string, init?: RequestInit): Promise<T> => {
      return api<T>(url, { ...init, cache: 'no-store' });
    },
    [api],
  );

  return { api, apiFresh };
}
