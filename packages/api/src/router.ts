/**
 * @soulcanvas/api — AppRouter barrel
 *
 * Architecture:
 *   namespaces/
 *     public/   — no auth required
 *       health/ping
 *     private/  — auth + rate limiting required
 *       entries/ (create | update | getOne | getGalaxy)
 *       tasks/   (convertToTask)
 *
 * Each route is defined by two files:
 *   constants.ts — Zod schema + rate-limit config
 *   run.ts       — business logic called after validation
 *
 * This barrel file is the ONLY place that:
 *   1. Instantiates tRPC procedures with per-route schemas & configs.
 *   2. Calls the run() handler.
 *   3. Exports the AppRouter type consumed by the frontend client.
 */
import { TRPCError } from '@trpc/server';
import {
  type Services,
  type TrpcContext,
  makeRateLimitMiddleware,
  protectedProcedure,
  publicProcedure,
  router,
} from './trpc.js';

// ---------------------------------------------------------------------------
// Re-export context type (consumed by trpc.context.ts in backend)
// ---------------------------------------------------------------------------
export type { TrpcContext, Services };

// ---------------------------------------------------------------------------
// Service API shapes (implemented by NestJS services)
// ---------------------------------------------------------------------------
export type EntryKind = 'entry' | 'task';

export type GalaxyEntry = {
  id: string;
  content: string;
  type: EntryKind;
  sentimentColor: string | null;
  sentimentLabel: string | null;
  x: number;
  y: number;
  z: number;
  visualMass: number | null;
};

export type EntriesApi = {
  createEntry: (userId: string, content: string, type?: EntryKind) => Promise<{ id: string }>;
  updateEntry: (userId: string, id: string, content: string) => Promise<void>;
  getEntry: (userId: string, id: string) => Promise<{ id: string; content: string } | null>;
  getGalaxyData: (userId: string) => Promise<GalaxyEntry[]>;
};

export type TasksApi = {
  convertToTask: (userId: string, entryId: string, deadline: Date) => Promise<void>;
};

export type UsersApi = {
  ensureUser: (clerkId: string) => Promise<string>;
};

// ---------------------------------------------------------------------------
// Namespace: public — no authentication required
// ---------------------------------------------------------------------------
import {
  config as pingConfig,
  schema as pingSchema,
} from './namespaces/public/health/ping/constants.js';
import { run as pingRun } from './namespaces/public/health/ping/run.js';

function buildPublicRouter() {
  return router({
    health: router({
      ping: publicProcedure
        .use(makeRateLimitMiddleware(pingConfig.rateLimit))
        .input(pingSchema)
        .query(({ input }) => pingRun(input)),
    }),
  });
}

// ---------------------------------------------------------------------------
// Namespace: private — auth + ensureUser sync required
// ---------------------------------------------------------------------------
import {
  config as createEntryConfig,
  schema as createEntrySchema,
} from './namespaces/private/entries/create/constants.js';
import { run as createEntryRun } from './namespaces/private/entries/create/run.js';

import {
  config as updateEntryConfig,
  schema as updateEntrySchema,
} from './namespaces/private/entries/update/constants.js';
import { run as updateEntryRun } from './namespaces/private/entries/update/run.js';

import {
  config as getOneConfig,
  schema as getOneSchema,
} from './namespaces/private/entries/getOne/constants.js';
import { run as getOneRun } from './namespaces/private/entries/getOne/run.js';

import { config as getGalaxyConfig } from './namespaces/private/entries/getGalaxy/constants.js';
import { run as getGalaxyRun } from './namespaces/private/entries/getGalaxy/run.js';

import {
  config as convertToTaskConfig,
  schema as convertToTaskSchema,
} from './namespaces/private/tasks/convertToTask/constants.js';
import { run as convertToTaskRun } from './namespaces/private/tasks/convertToTask/run.js';

function buildPrivateRouter(services: Services) {
  /**
   * Protected procedure with ensureUser — resolves Clerk ID → internal DB UUID
   * and injects it into ctx.userId for the handler.
   */
  const authedProcedure = protectedProcedure.use(async ({ ctx, next }) => {
    // Narrow: ctx.userId is guaranteed non-null here (requireAuth ran above)
    const dbUserId = await services.users.ensureUser(ctx.userId!);
    return next({ ctx: { ...ctx, userId: dbUserId } });
  });

  return router({
    entries: router({
      create: authedProcedure
        .use(makeRateLimitMiddleware(createEntryConfig.rateLimit))
        .input(createEntrySchema)
        .mutation(({ input, ctx }) => createEntryRun(input, ctx, services)),

      update: authedProcedure
        .use(makeRateLimitMiddleware(updateEntryConfig.rateLimit))
        .input(updateEntrySchema)
        .mutation(({ input, ctx }) => updateEntryRun(input, ctx, services)),

      getOne: authedProcedure
        .use(makeRateLimitMiddleware(getOneConfig.rateLimit))
        .input(getOneSchema)
        .query(({ input, ctx }) => getOneRun(input, ctx, services)),

      getGalaxy: authedProcedure
        .use(makeRateLimitMiddleware(getGalaxyConfig.rateLimit))
        .query(({ ctx }) => getGalaxyRun(undefined, ctx, services)),
    }),

    tasks: router({
      convertToTask: authedProcedure
        .use(makeRateLimitMiddleware(convertToTaskConfig.rateLimit))
        .input(convertToTaskSchema)
        .mutation(({ input, ctx }) => convertToTaskRun(input, ctx, services)),
    }),
  });
}

// ---------------------------------------------------------------------------
// App router factory — called by NestJS TrpcRouter with injected services
// ---------------------------------------------------------------------------
export function createAppRouter(services: Services) {
  return router({
    public: buildPublicRouter(),
    private: buildPrivateRouter(services),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

// ---------------------------------------------------------------------------
// Context factory (re-exported for convenience — used by trpc.ts)
// ---------------------------------------------------------------------------
export function createContext(opts?: {
  userId?: string;
  authToken?: string;
  ip?: string;
}): TrpcContext {
  return {
    userId: opts?.userId,
    authToken: opts?.authToken,
    ip: opts?.ip ?? '127.0.0.1',
  };
}
