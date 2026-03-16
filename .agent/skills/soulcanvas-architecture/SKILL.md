---
name: soulcanvas-architecture
description: Technical Architecture and Design guidelines for the SoulCanvas project.
---

# 🚀 SoulCanvas Technical Architecture

**Architecture Style:** Distributed Monorepo (Bun + Turborepo Workspaces)

---

## 1. System High-Level Overview

| Layer | Technology |
|-------|-----------|
| **Platform Shells** | Next.js 16 (Web), Expo (Mobile — future), Tauri (Desktop — future) |
| **Internal Ops** | SoulLabs Command Center (Next.js Admin Dashboard) |
| **Core Logic** | Shared TypeScript packages (database, API, logic, AI, UI) |
| **Data Engine** | NestJS Backend + PostgreSQL (Neon) + BullMQ (Redis) |
| **Communication** | tRPC v11 (end-to-end type safety) |
| **Auth** | Clerk (frontend + backend + admin) |
| **Orchestrator** | Turborepo |

## 2. Monorepo Map

```
soulcanvas/
├── apps/
│   ├── frontend/          # Next.js 16, port 3001
│   ├── backend/           # NestJS on Bun, port 3000
│   └── admin-dashboard/   # Command Center, port 3002
├── packages/
│   ├── database/          # Drizzle ORM schemas + Neon client
│   ├── api/               # tRPC router + rate-limiting + masquerade
│   ├── ai-engine/         # AI prompts & LLM integration
│   ├── logic/             # Pure canvas calculations
│   ├── ui-kit/            # Design system
│   └── typescript-config/ # Shared TS configs
```

## 3. Frontend Architecture

- **Framework:** Next.js 16 (App Router + Turbopack)
- **3D Engine:** React Three Fiber (Three.js)
- **Styling:** Tailwind CSS + Framer Motion
- **State:** TanStack Query v5
- **Auth:** Clerk (`@clerk/nextjs`)
- **Observability:** Sentry + PostHog + Vercel Analytics

## 4. Backend Architecture

- **Runtime:** Bun
- **Framework:** NestJS
- **Auth:** Clerk (`@clerk/backend`)
- **API:** tRPC v11 (type-safe contract in `@soulcanvas/api`)
- **Database:** PostgreSQL (Neon) via Drizzle ORM
- **Job Queue:** BullMQ (Redis) for notifications, GDPR exports
- **Logging:** Pino + Pino-HTTP
- **Security:** Helmet, AES-256-GCM encryption, sliding-window rate limiter
- **Monitoring:** Sentry (`@sentry/nestjs`)

## 5. Command Center (Admin Dashboard)

- **Auth:** Clerk RBAC (Super Admin → Engineer → Support)
- **Modules:**
  - User Management (CRUD, account status, billing tier)
  - Team Fleet Management (invites, permissions matrix)
  - Broadcast Engine (email/WhatsApp campaigns via BullMQ)
  - AI Weaver Telemetry (token burn rate, cost per user)
  - Financial Hub (MRR, Stripe webhook logs)
  - Command Palette (CMD+K global search)
  - Zero-Knowledge Masquerade (impersonation with data scrambling)
  - Compliance Engine (GDPR export, 30-day data purge, rate limit visualizer)
  - Audit Logs (all admin actions tracked)

## 6. Security Model

- **E2E Encryption:** Journal content encrypted with AES-256-GCM before storage
- **Rate Limiting:** Per-IP sliding window on every tRPC route
- **RBAC:** Clerk-backed roles with permission wilcard (`['*']` for super admins)
- **Masquerade:** Support impersonation with tRPC middleware scrambling all text fields

## 7. Observability

| Tool | Purpose |
|------|---------|
| **Sentry** | Error tracking (frontend + backend + admin) |
| **PostHog** | Product analytics, session replays |
| **Pino** | Structured backend logging |
| **Vercel Analytics** | Web vitals & speed insights |
| **BullBoard** | BullMQ job queue monitoring |

## 8. Quality & Consistency

- **Biome** (replaces ESLint/Prettier — 20x faster)
- **Husky + lint-staged** (pre-commit checks)
- **Knip** (dead code detection)
- **TypeScript strict mode** across all packages
