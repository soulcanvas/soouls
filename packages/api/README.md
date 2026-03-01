# `@soulcanvas/api` — The API Contract Package

This package is the **single source of truth** for all tRPC routes in SoulCanvas. It is imported by both the **backend** (to build the router) and the **frontend** (for end-to-end type safety). No code generation. No REST. Pure TypeScript.

---

## How the Two Packages Relate

```
packages/api          ← "The Contract"  defines WHAT routes exist, validates input
apps/backend          ← "The Worker"    runs the server, owns DB logic
apps/frontend         ← "The Consumer"  calls routes with full type safety
```

Both `apps/backend` and `apps/frontend` import `packages/api`. The backend calls `createAppRouter(services)` passing in real NestJS service implementations. The frontend imports `AppRouter` as a type to power the tRPC React client.

---

## Directory Structure

```
packages/api/src/
│
├── rate-limit.ts          ← In-memory sliding-window rate limiter utility
├── trpc.ts                ← tRPC instance, middleware, base procedures
├── router.ts              ← Thin barrel: assembles the full AppRouter
│
└── namespaces/
    │
    ├── public/            ── No authentication required ──
    │   └── health/
    │       └── ping/
    │           ├── constants.ts
    │           └── run.ts
    │
    └── private/           ── Must be logged in (Clerk + DB user sync) ──
        ├── entries/
        │   ├── create/
        │   │   ├── constants.ts
        │   │   └── run.ts
        │   ├── update/
        │   │   ├── constants.ts
        │   │   └── run.ts
        │   ├── getOne/
        │   │   ├── constants.ts
        │   │   └── run.ts
        │   └── getGalaxy/
        │       ├── constants.ts
        │       └── run.ts
        └── tasks/
            └── convertToTask/
                ├── constants.ts
                └── run.ts
```

---

## The Two Files in Every Route Folder

### `constants.ts` — The Gatekeeper

Every route folder has a `constants.ts` that owns **two things**:

1. **The Zod schema** — validates and sanitizes all user input before anything else runs.
2. **The rate-limit config** — how many requests per window this route allows.

```typescript
// Example: namespaces/private/entries/create/constants.ts
import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

export const schema = z.object({
  content: z.string().min(1).max(50_000).trim(),
  type: z.enum(['entry', 'task']).optional().default('entry'),
});

export type Input = z.infer<typeof schema>;

export const config = {
  rateLimit: { maxRequests: 30, windowMs: 60_000 } satisfies RateLimitConfig,
} as const;
```

**Rules for `constants.ts`:**
- Never import from tRPC, NestJS, or backend services.
- Only imports: `zod`, `RateLimitConfig` type from `rate-limit.ts`.
- Always export `schema`, `Input` type, and `config`.

### `run.ts` — The Worker

The handler that runs **after** validation passes. It receives:
- `input` — the Zod-validated, typed input object (or `undefined` for routes with no input).
- `ctx` — the authenticated context, always containing `userId` (internal DB UUID).
- `services` — the injected NestJS service implementations.

```typescript
// Example: namespaces/private/entries/create/run.ts
import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(
  input: Input,
  ctx: ProtectedContext,
  services: Services,
): Promise<{ id: string }> {
  return services.entries.createEntry(ctx.userId, input.content, input.type);
}
```

**Rules for `run.ts`:**
- No validation logic here — that already happened in `constants.ts`.
- No direct DB imports — only calls `services.*` methods.
- Must be a pure `async function run(...)`.

---

## Core Infrastructure Files

### `trpc.ts` — The tRPC Engine

Defines the two base procedures every route uses:

| Procedure | Security layers |
|---|---|
| `publicProcedure` | Rate limit only |
| `protectedProcedure` | Rate limit → Auth check → `ensureUser` (Clerk ID → DB UUID) |

```typescript
// How middleware chains:
publicProcedure    = rate-limit
protectedProcedure = rate-limit → requireAuth → ensureUser in router
```

Also exports:
- `TrpcContext` — `{ userId?, authToken?, ip }` (set by `trpc.context.ts` in backend)
- `ProtectedContext` — `TrpcContext & { userId: string }` (userId guaranteed)
- `Services` — `{ entries: EntriesApi, tasks: TasksApi, users: UsersApi }`
- `makeRateLimitMiddleware(config)` — factory for per-route rate limit middlewares

### `rate-limit.ts` — The Sliding-Window Limiter

In-memory rate limiter. No Redis needed. Keyed on `ip:procedurePath`.

```typescript
const result = checkRateLimit(ip, routeKey, config);
// result.ok       → true if within limit
// result.retryAfterMs → ms until window resets (0 if ok)
```

Built-in presets:

| Export | Limit |
|---|---|
| `DEFAULT_RATE_LIMIT` | 60 req / 60s |
| `MUTATION_RATE_LIMIT` | 30 req / 60s |
| `STRICT_RATE_LIMIT` | 10 req / 60s |

### `router.ts` — The Barrel

Thin wiring file. For each route it:
1. Imports `schema` and `config` from `constants.ts`
2. Imports `run` from `run.ts`
3. Attaches the per-route rate-limit middleware
4. Attaches the Zod schema for validation
5. Calls `run()` in the handler

The final output is:
```
AppRouter
  └── public
  │     └── health.ping          (query)
  └── private
        ├── entries.create       (mutation)
        ├── entries.update       (mutation)
        ├── entries.getOne       (query)
        ├── entries.getGalaxy    (query)
        └── tasks.convertToTask  (mutation)
```

---

## Full Request Lifecycle

```
Frontend: trpc.private.entries.create.mutate({ content: "..." })
  │
  ▼
HTTP POST /trpc/private.entries.create
  │
apps/backend/trpc/trpc.controller.ts     ← NestJS receives request
  │
apps/backend/trpc/trpc.context.ts        ← Extracts: auth token, IP
  │
packages/api/trpc.ts (rate-limit middleware)
  │  Checks sliding-window for this IP + route
  │  → TOO_MANY_REQUESTS if over limit
  │
packages/api/trpc.ts (auth middleware)
  │  Verifies Clerk token → gets clerkId
  │  → UNAUTHORIZED if missing/invalid
  │  Calls UsersService.ensureUser(clerkId)
  │  → resolves Clerk ID to internal DB UUID
  │
packages/api router.ts (Zod validation)
  │  Validates input against constants.ts schema
  │  → BAD_REQUEST with field errors if invalid
  │
packages/api/namespaces/private/entries/create/run.ts
  │  run(validatedInput, { userId: "db-uuid" }, services)
  │
apps/backend/entries/entries.service.ts
  │  Encrypts content (AES-256-GCM)
  │  Inserts into journal_entries + canvas_nodes
  │
  ▼
Returns { id: "new-entry-uuid" }
```

---

## Backend Security Layers (`apps/backend`)

Beyond the API package, the NestJS server adds:

| Layer | File | What it does |
|---|---|---|
| **Helmet** | `main.ts` | Sets 11 protective HTTP headers (CSP, HSTS, X-Content-Type-Options, etc.) |
| **CORS** | `main.ts` | Only allows `FRONTEND_URL` env origin. Defaults to `localhost:3001`. |
| **Trust Proxy** | `main.ts` | `app.set('trust proxy', 1)` — resolves real client IP behind reverse proxies |
| **IP Forwarding** | `trpc.context.ts` | Reads `x-forwarded-for` → passes `ip` into tRPC context for rate limiter |
| **AES-256-GCM** | `utils/encryption.ts` | Encrypts all entry content before it hits the DB, decrypts on read |

---

## Rate Limits by Route

| Route | Limit | Reason |
|---|---|---|
| `public.health.ping` | 120 / 60s | Health check — generous |
| `private.entries.create` | 30 / 60s | Write — intentional action |
| `private.entries.update` | 60 / 60s | Auto-save fires frequently |
| `private.entries.getOne` | 60 / 60s | Normal read |
| `private.entries.getGalaxy` | 20 / 60s | Heavy join query |
| `private.tasks.convertToTask` | 20 / 60s | Rare, intentional action |

---

## How to Add a New Route

Follow this exact pattern. Do NOT deviate into ad-hoc schemas inside `router.ts`.

### Step 1 — Create the folder
```
namespaces/
  private/          (or public/)
    <apiName>/      (e.g. "entries", "tasks", "notes")
      <routeName>/  (e.g. "delete", "archive", "search")
        constants.ts
        run.ts
```

### Step 2 — Write `constants.ts`
```typescript
import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

export const schema = z.object({
  // Define and validate all inputs here
  id: z.string().uuid('Must be a valid UUID'),
});

export type Input = z.infer<typeof schema>;

export const config = {
  rateLimit: { maxRequests: 30, windowMs: 60_000 } satisfies RateLimitConfig,
} as const;
```

### Step 3 — Write `run.ts`
```typescript
import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(
  input: Input,
  ctx: ProtectedContext,
  services: Services,
): Promise<{ success: true }> {
  // Call the appropriate service method
  await services.entries.someMethod(ctx.userId, input.id);
  return { success: true };
}
```

### Step 4 — Register in `router.ts`
Import and wire inside `buildPrivateRouter()` (or `buildPublicRouter()` for public routes):

```typescript
import { config as myConfig, schema as mySchema } from './namespaces/private/entries/myRoute/constants.js';
import { run as myRun } from './namespaces/private/entries/myRoute/run.js';

// Inside buildPrivateRouter():
entries: router({
  // ... existing routes ...
  myRoute: authedProcedure
    .use(makeRateLimitMiddleware(myConfig.rateLimit))
    .input(mySchema)
    .mutation(({ input, ctx }) => myRun(input, ctx, services)), // or .query()
}),
```

### Step 5 — Add the method to the service (if new)
Add to `EntriesApi` / `TasksApi` type in `router.ts`, then implement in `apps/backend/src/entries/entries.service.ts`.

### Step 6 — Run type check
```bash
cd packages/api && bun x tsc --noEmit
cd apps/backend  && bun x tsc --noEmit
```

---

## Environment Variables Required

| Variable | Where used | Description |
|---|---|---|
| `CLERK_SECRET_KEY` | `trpc.context.ts` | Verifies Clerk auth tokens |
| `FRONTEND_URL` | `main.ts` | CORS allowed origin (default: `http://localhost:3001`) |
| `DATABASE_URL` | `packages/database` | Neon PostgreSQL connection string |
| `PORT` | `main.ts` | Backend port (default: `3000`) |

---

## Package Exports

```json
{
  "./router":     "./src/router.ts",     ← AppRouter type + createAppRouter
  "./client":     "./src/client.ts",     ← createTRPCClient for frontend
  "./trpc":       "./src/trpc.ts",       ← Base procedures + context types
  "./rate-limit": "./src/rate-limit.ts"  ← checkRateLimit utility
}
```
