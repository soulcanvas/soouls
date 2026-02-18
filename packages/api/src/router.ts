import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// Create tRPC context with Clerk auth
export function createContext(opts?: { userId?: string; authToken?: string }) {
  return {
    userId: opts?.userId,
    authToken: opts?.authToken,
    // Add your context here (db, etc.)
  };
}

export type TrpcContext = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<TrpcContext>().create();

// Base router and procedure
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure (requires authentication)
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
  createEntry: (userId: string, content: string, type?: EntryKind) => Promise<unknown>;
  getGalaxyData: (userId: string) => Promise<GalaxyEntry[]>;
};

export type TasksApi = {
  convertToTask: (entryId: string, deadline: Date) => Promise<void>;
};

export type UsersApi = {
  ensureUser: (clerkId: string) => Promise<string>; // Returns internal UUID
};

export function createAppRouter(services: {
  entries: EntriesApi;
  tasks: TasksApi;
  users: UsersApi;
}) {
  const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.userId) {
      throw new Error('Unauthorized');
    }
    const dbUserId = await services.users.ensureUser(ctx.userId);
    return next({
      ctx: {
        ...ctx,
        userId: dbUserId, // Replace Clerk ID with Internal DB UUID
      },
    });
  });

  return router({
    hello: publicProcedure.input(z.object({ name: z.string() })).query(({ input }) => {
      return {
        greeting: `Hello ${input.name}!`,
      };
    }),

    createEntry: protectedProcedure
      .input(
        z.object({
          content: z.string(),
          type: z.enum(['entry', 'task']).optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        return services.entries.createEntry(ctx.userId, input.content, input.type ?? 'entry');
      }),

    getGalaxyData: protectedProcedure.query(async ({ ctx }) => {
      return services.entries.getGalaxyData(ctx.userId);
    }),

    convertToTask: protectedProcedure
      .input(
        z.object({
          entryId: z.string(),
          deadline: z.string(), // ISO string
        }),
      )
      .mutation(async ({ input }) => {
        await services.tasks.convertToTask(input.entryId, new Date(input.deadline));
        return { success: true };
      }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
