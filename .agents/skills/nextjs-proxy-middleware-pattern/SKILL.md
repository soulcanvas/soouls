---
name: nextjs-proxy-middleware-pattern
description: React 19/Next.js 16 Proxy Middleware Pattern. Use when adding route protection, API proxying, or Clerk authentication logic. Triggers on tasks involving middleware.ts, routing, edge runtime, or API interceptors.
---

# Next.js 16 / React 19 Proxy Middleware Pattern

In this architecture, the standard Next.js `middleware.ts` file is deprecated in favor of a specialized `proxy.ts` file placed at the same root level of the application. All edge routing, proxying, and authentication logic **must** be contained within `proxy.ts`.

## Core Requirements

1. **Never create `middleware.ts`**: Do not add or use a `middleware.ts` or `middleware.js` file in any application directory.
2. **Centralized Edge Logic**: Use `proxy.ts` for all edge-compatible interceptors. This includes Clerk authentication, rate limiting, bot protection, and API proxy rewrites.
3. **Matcher Configuration**: The `config.matcher` array must be exported from `proxy.ts` just as it would be from `middleware.ts` to tell Next.js which routes to invoke the proxy on.

## Implementation Pattern

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)']);
const isApiRoute = createRouteMatcher(['/command-api(.*)', '/api/(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    if (isApiRoute(req)) {
      // API Route Protection (Returns JSON, prevents HTML redirects)
      const { userId } = await auth();
      if (!userId) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      // Standard Page Protection (Redirects to sign-in)
      await auth.protect();
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\\\.(?:html?|css|js(?!on)|png|jpg|jpeg|gif|svg|ico|woff2?)).*)',
    // Always run for API routes
    '/(api|trpc|command-api)(.*)',
  ],
};
```

## When to apply this skill

- If a user asks to "add middleware", "protect a route", or "intercept a request", apply the changes to `proxy.ts`.
- If you find a `middleware.ts` file, delete it and migrate its contents to `proxy.ts`.
- When dealing with Clerk authentication in Next.js applications within this repository.
