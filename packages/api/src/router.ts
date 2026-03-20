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
  previewText: string;
  type: EntryKind;
  sentimentColor: string | null;
  sentimentLabel: string | null;
  createdAt: string;
  x: number;
  y: number;
  z: number;
  visualMass: number | null;
};

export type UserEntry = {
  id: string;
  content: string;
  type: EntryKind;
  title: string | null;
  mediaUrl: string | null;
  sentimentColor: string | null;
  sentimentLabel: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type AdminEntry = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  type: EntryKind;
  title: string | null;
  content: string;
  mediaUrl: string | null;
  sentimentColor: string | null;
  sentimentLabel: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type EntriesApi = {
  createEntry: (userId: string, content: string, type?: EntryKind) => Promise<{ id: string }>;
  updateEntry: (userId: string, id: string, content: string) => Promise<void>;
  getEntry: (userId: string, id: string) => Promise<{ id: string; content: string } | null>;
  getGalaxyData: (
    userId: string,
    limit?: number,
    cursor?: number,
  ) => Promise<{ items: GalaxyEntry[]; nextCursor: number | null }>;
  getAllEntries: (
    userId: string,
    limit?: number,
    cursor?: number,
  ) => Promise<{ items: UserEntry[]; nextCursor: number | null }>;
  listAllEntriesAdmin: (
    limit?: number,
    offset?: number,
  ) => Promise<{ items: AdminEntry[]; total: number }>;
  getUploadPresignedUrl: (
    userId: string,
    entryId: string,
    contentType: string,
  ) => Promise<{ uploadUrl: string; publicUrl: string }>;
  updateEntryMediaUrl: (userId: string, entryId: string, mediaUrl: string) => Promise<void>;
  migrateMedia: (userId: string) => Promise<{ migratedCount: number }>;
};

export type TasksApi = {
  convertToTask: (userId: string, entryId: string, deadline: Date) => Promise<void>;
};

export type MessagingApi = {
  getCenter: (userId: string) => Promise<{
    viewer: {
      email: string;
      name: string | null;
      canManageCampaigns: boolean;
    };
    preferences: {
      phoneNumber: string | null;
      marketingEmailOptIn: boolean;
      marketingWhatsappOptIn: boolean;
      transactionalEmailOptIn: boolean;
      transactionalWhatsappOptIn: boolean;
      welcomeEmailSentAt: Date | null;
      welcomeWhatsappSentAt: Date | null;
      lastSecureAccessSentAt: Date | null;
    };
    providerHealth: {
      emailConfigured: boolean;
      whatsappConfigured: boolean;
    };
    templates: Array<{
      key: string;
      label: string;
      description: string;
    }>;
    stats: {
      totalUsers: number;
      emailReachable: number;
      whatsappReachable: number;
      campaignsSent: number;
    } | null;
    brands: Array<{
      key: 'soulcanvas' | 'soulcanvas-studio' | 'founder-desk';
      label: string;
      eyebrow: string;
    }>;
    campaigns: Array<{
      id: string;
      brandKey: 'soulcanvas' | 'soulcanvas-studio' | 'founder-desk';
      title: string;
      subject: string;
      status: 'draft' | 'sending' | 'sent' | 'partially_sent' | 'failed';
      channels: Array<'email' | 'whatsapp'>;
      totalRecipients: number;
      emailRecipients: number;
      whatsappRecipients: number;
      lastSentAt: Date | null;
      createdAt: Date;
    }>;
    recentDeliveries: Array<{
      id: string;
      brandKey: string;
      channel: 'email' | 'whatsapp';
      category: 'transactional' | 'marketing' | 'security' | 'product';
      templateKey: string;
      status: 'pending' | 'sent' | 'failed' | 'skipped';
      recipient: string;
      subject: string | null;
      provider: string;
      createdAt: Date;
    }>;
  }>;
  updatePreferences: (
    userId: string,
    input: {
      phoneNumber?: string | null;
      marketingEmailOptIn: boolean;
      marketingWhatsappOptIn: boolean;
      transactionalEmailOptIn: boolean;
      transactionalWhatsappOptIn: boolean;
    },
  ) => Promise<{
    phoneNumber: string | null;
    marketingEmailOptIn: boolean;
    marketingWhatsappOptIn: boolean;
    transactionalEmailOptIn: boolean;
    transactionalWhatsappOptIn: boolean;
    welcomeEmailSentAt: Date | null;
    welcomeWhatsappSentAt: Date | null;
    lastSecureAccessSentAt: Date | null;
  }>;
  sendCampaign: (
    userId: string,
    input: {
      brandKey: 'soulcanvas' | 'soulcanvas-studio' | 'founder-desk';
      title: string;
      subject: string;
      markdownBody: string;
      whatsappBody?: string;
      ctaLabel?: string;
      ctaUrl?: string;
      channels: Array<'email' | 'whatsapp'>;
    },
  ) => Promise<{
    campaignId: string;
    status: 'queued' | 'sent' | 'partially_sent' | 'failed';
    totalRecipients: number;
    emailRecipients: number;
    whatsappRecipients: number;
    failedCount: number;
  }>;
  requestSecureAccessLink: (email: string) => Promise<{ accepted: boolean }>;
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
import {
  config as requestSecureAccessConfig,
  schema as requestSecureAccessSchema,
} from './namespaces/public/messaging/requestSecureAccess/constants.js';
import { run as requestSecureAccessRun } from './namespaces/public/messaging/requestSecureAccess/run.js';

function buildPublicRouter(services: Services) {
  return router({
    health: router({
      ping: publicProcedure
        .use(makeRateLimitMiddleware(pingConfig.rateLimit))
        .input(pingSchema)
        .query(({ input }) => pingRun(input)),
    }),
    messaging: router({
      requestSecureAccess: publicProcedure
        .use(makeRateLimitMiddleware(requestSecureAccessConfig.rateLimit))
        .input(requestSecureAccessSchema)
        .mutation(({ input, ctx }) => requestSecureAccessRun(input, ctx, services)),
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

import {
  config as getGalaxyConfig,
  schema as getGalaxySchema,
} from './namespaces/private/entries/getGalaxy/constants.js';
import { run as getGalaxyRun } from './namespaces/private/entries/getGalaxy/run.js';

import {
  config as getUploadUrlConfig,
  schema as getUploadUrlSchema,
} from './namespaces/private/entries/getUploadUrl/constants.js';
import { run as getUploadUrlRun } from './namespaces/private/entries/getUploadUrl/run.js';

import {
  config as updateMediaUrlConfig,
  schema as updateMediaUrlSchema,
} from './namespaces/private/entries/updateMediaUrl/constants.js';
import { run as updateMediaUrlRun } from './namespaces/private/entries/updateMediaUrl/run.js';

import {
  config as migrateMediaConfig,
  inputSchema as migrateMediaSchema,
} from './namespaces/private/entries/migrateMedia/constants.js';
import { run as migrateMediaRun } from './namespaces/private/entries/migrateMedia/run.js';

import {
  config as getAllConfig,
  schema as getAllSchema,
} from './namespaces/private/entries/getAll/constants.js';
import { run as getAllRun } from './namespaces/private/entries/getAll/run.js';

import {
  config as getCenterConfig,
  schema as getCenterSchema,
} from './namespaces/private/messaging/getCenter/constants.js';
import { run as getCenterRun } from './namespaces/private/messaging/getCenter/run.js';
import {
  config as sendCampaignConfig,
  schema as sendCampaignSchema,
} from './namespaces/private/messaging/sendCampaign/constants.js';
import { run as sendCampaignRun } from './namespaces/private/messaging/sendCampaign/run.js';
import {
  config as updatePreferencesConfig,
  schema as updatePreferencesSchema,
} from './namespaces/private/messaging/updatePreferences/constants.js';
import { run as updatePreferencesRun } from './namespaces/private/messaging/updatePreferences/run.js';
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
    const clerkUserId = ctx.userId;
    if (!clerkUserId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be signed in to access this resource.',
      });
    }

    const dbUserId = await services.users.ensureUser(clerkUserId);
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
        .input(getGalaxySchema) // Use the schema from constants
        .query(({ input, ctx }) => getGalaxyRun(input, ctx, services)),

      getUploadUrl: authedProcedure
        .use(makeRateLimitMiddleware(getUploadUrlConfig.rateLimit))
        .input(getUploadUrlSchema)
        .mutation(({ input, ctx }) => getUploadUrlRun(input, ctx, services)),

      updateMediaUrl: authedProcedure
        .use(makeRateLimitMiddleware(updateMediaUrlConfig.rateLimit))
        .input(updateMediaUrlSchema)
        .mutation(({ input, ctx }) => updateMediaUrlRun(input, ctx, services)),

      migrateMedia: authedProcedure
        .use(makeRateLimitMiddleware(migrateMediaConfig.rateLimit))
        .input(migrateMediaSchema)
        .mutation(({ input, ctx }) => migrateMediaRun(input, ctx, services)),

      getAll: authedProcedure
        .use(makeRateLimitMiddleware(getAllConfig.rateLimit))
        .input(getAllSchema)
        .query(({ input, ctx }) => getAllRun(input, ctx, services)),
    }),

    tasks: router({
      convertToTask: authedProcedure
        .use(makeRateLimitMiddleware(convertToTaskConfig.rateLimit))
        .input(convertToTaskSchema)
        .mutation(({ input, ctx }) => convertToTaskRun(input, ctx, services)),
    }),

    messaging: router({
      getCenter: authedProcedure
        .use(makeRateLimitMiddleware(getCenterConfig.rateLimit))
        .input(getCenterSchema)
        .query(({ input, ctx }) => getCenterRun(input, ctx, services)),

      updatePreferences: authedProcedure
        .use(makeRateLimitMiddleware(updatePreferencesConfig.rateLimit))
        .input(updatePreferencesSchema)
        .mutation(({ input, ctx }) => updatePreferencesRun(input, ctx, services)),

      sendCampaign: authedProcedure
        .use(makeRateLimitMiddleware(sendCampaignConfig.rateLimit))
        .input(sendCampaignSchema)
        .mutation(({ input, ctx }) => sendCampaignRun(input, ctx, services)),
    }),
  });
}

// ---------------------------------------------------------------------------
// App router factory — called by NestJS TrpcRouter with injected services
// ---------------------------------------------------------------------------
export function createAppRouter(services: Services) {
  return router({
    public: buildPublicRouter(services),
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
