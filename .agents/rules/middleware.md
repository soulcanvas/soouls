---
description: Always use `proxy.ts` for Next.js middleware
---
# Next.js Middleware Rule

In the `soouls` repository, the Next.js frontend application (`apps/frontend`) has overridden the standard middleware file name.

**DO NOT CREATE `middleware.ts`**.
The project uses `apps/frontend/proxy.ts` as the sole middleware file. All Clerk authentication, edge configuration, and routing redirect logic MUST be placed inside `proxy.ts`.
