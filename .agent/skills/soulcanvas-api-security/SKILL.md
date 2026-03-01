---
name: soulcanvas-api-security
description: The SoulCanvas API namespace pattern. Use when adding, modifying, or debugging tRPC routes in packages/api, or when working with the NestJS backend in apps/backend. Covers the constants.ts + run.ts split, Zod validation, rate limiting, auth middleware, and the full request lifecycle. Required reading before touching any file in packages/api/src/namespaces/.
---

# SoulCanvas API Security & Namespace Pattern

## When to Use This Skill

Read this skill whenever you are:
- Adding a new tRPC route to `packages/api`
- Modifying an existing route's validation or business logic
- Debugging a `TOO_MANY_REQUESTS`, `UNAUTHORIZED`, or `BAD_REQUEST` tRPC error
- Working on `apps/backend` services that are called by the API
- Updating `apps/frontend` call sites after a route changes

---

## Architecture in 30 Seconds

There are **two separate packages** that together form the API:

```
packages/api       ← "The Contract"  — routes, schemas, types, middleware
apps/backend       ← "The Worker"    — NestJS server, DB access, encryption
apps/frontend      ← "The Consumer"  — Next.js, React, tRPC client hooks
```

- `packages/api` is imported by **both** backend and frontend.
- `apps/backend` never touches the DB directly from route files — only through service methods.
- `apps/frontend` uses the `AppRouter` type from `packages/api` for full end-to-end type safety.

---

## The Namespace Directory Rule

Every route lives at this exact path:

```
packages/api/src/namespaces/<namespace>/<apiName>/<routeName>/
```

- `<namespace>` is `public` (no auth) or `private` (requires Clerk login).
- `<apiName>` groups related routes (e.g. `entries`, `tasks`, `users`).
- `<routeName>` is the specific operation (e.g. `create`, `update`, `getOne`).

Every route folder contains **exactly two files**:

### `constants.ts` — The Gatekeeper
Owns: Zod schema + rate-limit config. Nothing else.

```typescript
import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

// 1. The Zod schema — validates ALL user input
export const schema = z.object({
  content: z.string().min(1).max(50_000).trim(),
  type: z.enum(['entry', 'task']).optional().default('entry'),
});

export type Input = z.infer<typeof schema>;

// 2. Rate-limit config — how many requests per window
export const config = {
  rateLimit: { maxRequests: 30, windowMs: 60_000 } satisfies RateLimitConfig,
} as const;
```

**RULES for constants.ts:**
- ❌ Never import tRPC, NestJS, or backend services
- ❌ Never write business logic here
- ✅ Only imports: `zod` and `RateLimitConfig` type
- ✅ Always export: `schema`, `Input` type alias, `config`

### `run.ts` — The Worker
Owns: The actual handler code. No validation. No auth checks. Those already happened.

```typescript
import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(
  input: Input,           // Already Zod-validated typed input
  ctx: ProtectedContext,  // ctx.userId is internal DB UUID (guaranteed non-null)
  services: Services,     // Injected NestJS service implementations
): Promise<{ id: string }> {
  return services.entries.createEntry(ctx.userId, input.content, input.type);
}
```

**RULES for run.ts:**
- ❌ Never re-validate input — trust that `constants.ts` already did it
- ❌ Never import from DB directly — only call `services.*` methods
- ✅ Always export a single `async function run(...)`
- ✅ For `public` routes, the third `services` param may not be needed

---

## The Middleware Chain (In Order)

For a `private.*` route, this is the exact order of checks:

```
1. makeRateLimitMiddleware(config.rateLimit)
   └─ Checks ip:route sliding window
   └─ Throws TOO_MANY_REQUESTS if over limit

2. requireAuth (inside protectedProcedure)
   └─ Checks ctx.userId from Clerk token verification
   └─ Throws UNAUTHORIZED if missing

3. authedProcedure (inside buildPrivateRouter)
   └─ Calls services.users.ensureUser(clerkId)
   └─ Resolves Clerk ID → internal DB UUID
   └─ Replaces ctx.userId with the UUID

4. Zod schema validation (from constants.ts)
   └─ Validates and coerces input shape
   └─ Throws BAD_REQUEST with field errors if invalid

5. run() from run.ts
   └─ Business logic executes here — all checks passed
```

For a `public.*` route, only step 1 and the Zod validation happen before `run()`.

---

## How to Add a New Route — Step by Step

### 1. Create the folder
```bash
# Example: adding "private/entries/delete"
mkdir packages/api/src/namespaces/private/entries/delete
```

### 2. Write `constants.ts`
```typescript
import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

export const schema = z.object({
  id: z.string().uuid('Entry ID must be a valid UUID'),
});

export type Input = z.infer<typeof schema>;

export const config = {
  rateLimit: { maxRequests: 20, windowMs: 60_000 } satisfies RateLimitConfig,
} as const;
```

### 3. Write `run.ts`
```typescript
import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(
  input: Input,
  ctx: ProtectedContext,
  services: Services,
): Promise<{ success: true }> {
  await services.entries.deleteEntry(ctx.userId, input.id);
  return { success: true };
}
```

### 4. Register in `router.ts`
Inside `buildPrivateRouter()`, add imports at the top of the file:
```typescript
import { config as deleteEntryConfig, schema as deleteEntrySchema } from './namespaces/private/entries/delete/constants.js';
import { run as deleteEntryRun } from './namespaces/private/entries/delete/run.js';
```

Then add to the `entries` sub-router:
```typescript
entries: router({
  // ... existing routes ...
  delete: authedProcedure
    .use(makeRateLimitMiddleware(deleteEntryConfig.rateLimit))
    .input(deleteEntrySchema)
    .mutation(({ input, ctx }) => deleteEntryRun(input, ctx, services)),
}),
```

### 5. Update the service type + implementation
In `router.ts`, add the method to `EntriesApi`:
```typescript
export type EntriesApi = {
  // ... existing methods ...
  deleteEntry: (userId: string, id: string) => Promise<void>;
};
```

Then implement it in `apps/backend/src/entries/entries.service.ts`.

### 6. Update frontend call site
```typescript
// Old flat path style — DO NOT USE
trpc.someRoute.useMutation()

// New namespaced path — ALWAYS USE
trpc.private.entries.delete.useMutation()
trpc.private.entries.getOne.useQuery({ id })
trpc.public.health.ping.useQuery({ name: 'World' })
```

### 7. Verify
```bash
cd packages/api && bun x tsc --noEmit  # must return no output (clean)
cd apps/backend  && bun x tsc --noEmit  # must return no output (clean)
```

---

## Rate Limit Presets (from `rate-limit.ts`)

```typescript
DEFAULT_RATE_LIMIT  = { maxRequests: 60, windowMs: 60_000 }  // reads
MUTATION_RATE_LIMIT = { maxRequests: 30, windowMs: 60_000 }  // writes
STRICT_RATE_LIMIT   = { maxRequests: 10, windowMs: 60_000 }  // sensitive
```

Choose based on expected call frequency:
- **Auto-save routes** (update): `60/min` — fires on every pause in typing
- **Write routes** (create, delete): `20–30/min` — intentional user actions
- **Heavy read routes** (getGalaxy, DB joins): `20/min` — expensive queries
- **Auth-adjacent routes**: `10/min` — use `STRICT_RATE_LIMIT`

---

## Backend Services (in `apps/backend/src/`)

These are the NestJS `@Injectable()` classes that `run.ts` files call through `services.*`:

| Service | File | What it does |
|---|---|---|
| `EntriesService` | `entries/entries.service.ts` | CRUD for journal entries + canvas nodes. Encrypts with AES-256-GCM before DB writes. |
| `TasksService` | `tasks/tasks.service.ts` | Converts entries to tasks. Runs cron job to update visual mass on deadline proximity. |
| `UsersService` | `users/users.service.ts` | Syncs Clerk users into local DB (`ensureUser`). Called on every `private.*` request. |

**IMPORTANT:** Never import these services directly in `packages/api`. They are injected at runtime by NestJS via `createAppRouter(services)` in `trpc.router.ts`.

---

## Backend Security Config (in `apps/backend/src/main.ts`)

```typescript
app.use(helmet());                          // 11 security headers
app.enableCors({ origin: FRONTEND_URL });   // strict CORS
expressApp.set('trust proxy', 1);           // correct IP behind proxies
```

The `trpc.context.ts` reads the real IP:
```typescript
const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        ?? req.ip
        ?? '127.0.0.1';

return { userId, authToken, ip };  // ip is used by rate limiter
```

---

## Common Errors and Fixes

| Error code | Cause | Fix |
|---|---|---|
| `TOO_MANY_REQUESTS` | Rate limit exceeded | Increase `maxRequests` in `constants.ts` or add retry logic on frontend |
| `UNAUTHORIZED` | No/invalid Clerk token | Ensure frontend sends `Authorization: Bearer <token>` header via tRPC client |
| `BAD_REQUEST` | Zod validation failed | Check the schema in `constants.ts`; error message will list the field and reason |
| TS error on `retryAfterMs` | `strictNullChecks: false` breaks union narrowing | Use flat struct `{ ok: boolean; retryAfterMs: number }` — already done in `rate-limit.ts` |

---

## File Quick Reference

| Purpose | File |
|---|---|
| Rate limiter utility | `packages/api/src/rate-limit.ts` |
| tRPC instance + middleware | `packages/api/src/trpc.ts` |
| AppRouter barrel | `packages/api/src/router.ts` |
| All route schemas | `packages/api/src/namespaces/**/constants.ts` |
| All route handlers | `packages/api/src/namespaces/**/run.ts` |
| NestJS bootstrap | `apps/backend/src/main.ts` |
| Auth token + IP extraction | `apps/backend/src/trpc/trpc.context.ts` |
| Inject services into tRPC | `apps/backend/src/trpc/trpc.router.ts` |
| Entry DB logic | `apps/backend/src/entries/entries.service.ts` |
| AES-256 encryption | `apps/backend/src/utils/encryption.ts` |
