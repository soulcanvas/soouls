import { useCallback } from 'react';
import { trpc } from '../trpc';

export function useCacheInvalidation() {
  const utils = trpc.useUtils();

  const invalidateEntries = useCallback(() => {
    utils.private.entries.getGalaxy.invalidate();
    utils.private.entries.getAll.invalidate();
    utils.private.entries.getOne.invalidate();
  }, [utils]);

  const invalidateGalaxy = useCallback(() => {
    utils.private.entries.getGalaxy.invalidate();
  }, [utils]);

  const invalidateAllEntries = useCallback(() => {
    utils.private.entries.getAll.invalidate();
  }, [utils]);

  const invalidateSingleEntry = useCallback(
    (entryId: string) => {
      utils.private.entries.getOne.invalidate({ id: entryId });
      utils.private.entries.getGalaxy.invalidate();
      utils.private.entries.getAll.invalidate();
    },
    [utils],
  );

  const invalidateMessagingCenter = useCallback(() => {
    utils.private.messaging.getCenter.invalidate();
  }, [utils]);

  const invalidateMessagingPreferences = useCallback(() => {
    utils.private.messaging.getCenter.invalidate();
  }, [utils]);

  const invalidateAll = useCallback(() => {
    utils.invalidate();
  }, [utils]);

  return {
    invalidateEntries,
    invalidateGalaxy,
    invalidateAllEntries,
    invalidateSingleEntry,
    invalidateMessagingCenter,
    invalidateMessagingPreferences,
    invalidateAll,
  };
}

export function useOptimisticEntryUpdate(entryId: string | undefined) {
  const utils = trpc.useUtils();

  return useCallback(
    (content: string) => {
      if (!entryId) return;

      utils.private.entries.getOne.setData({ id: entryId }, { id: entryId, content });
      utils.private.entries.getGalaxy.invalidate();
      utils.private.entries.getAll.invalidate();
    },
    [entryId, utils],
  );
}

export function useOptimisticEntryCreate() {
  const utils = trpc.useUtils();

  return useCallback(() => {
    utils.private.entries.getGalaxy.invalidate();
    utils.private.entries.getAll.invalidate();
  }, [utils]);
}

export function usePrefetchEntries() {
  const utils = trpc.useUtils();

  const prefetchGalaxy = useCallback(() => {
    utils.private.entries.getGalaxy.prefetch({ limit: 100 });
  }, [utils]);

  const prefetchAllEntries = useCallback(() => {
    utils.private.entries.getAll.prefetch({ limit: 50 });
  }, [utils]);

  const prefetchSingleEntry = useCallback(
    (entryId: string) => {
      utils.private.entries.getOne.prefetch({ id: entryId });
    },
    [utils],
  );

  const prefetchMessagingCenter = useCallback(() => {
    utils.private.messaging.getCenter.prefetch();
  }, [utils]);

  return {
    prefetchGalaxy,
    prefetchAllEntries,
    prefetchSingleEntry,
    prefetchMessagingCenter,
  };
}
