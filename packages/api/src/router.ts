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

type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Base router and procedure
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure (requires authentication)
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new Error('Unauthorized');
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // Now guaranteed to be defined
    },
  });
});

// Example router with Zod validation
export const appRouter = router({
  hello: publicProcedure.input(z.object({ name: z.string() })).query(({ input }) => {
    return {
      greeting: `Hello ${input.name}!`,
    };
  }),

  getEntries: publicProcedure.input(z.object({ userId: z.string() })).query(async () => {
    // Implementation here
    return [];
  }),
});

export type AppRouter = typeof appRouter;
