# 🎨 SoulCanvas — 3D Life Journaling Platform

A privacy-first, 3D journaling application where thoughts become stars in your personal galaxy.

## 🏗️ Architecture

**Distributed Monorepo** powered by **Bun + Turborepo**.

### Apps

| App | Package | Port | Description |
|-----|---------|------|-------------|
| **Frontend** | `@soulcanvas/frontend` | 3001 | Next.js 16 — 3D galaxy canvas, journaling UI |
| **Backend** | `@soulcanvas/backend` | 3000 | NestJS — tRPC API, BullMQ workers, WebSocket |
| **Admin Dashboard** | `@soulcanvas/admin-dashboard` | 3002 | SoulLabs Command Center — RBAC, telemetry, ops |

### Shared Packages

| Package | Description |
|---------|-------------|
| `@soulcanvas/database` | Drizzle ORM schemas + Neon PostgreSQL client |
| `@soulcanvas/api` | Shared tRPC v11 router, rate-limiting, masquerade middleware |
| `@soulcanvas/ai-engine` | AI prompts, embeddings, LLM integration (OpenAI/Anthropic) |
| `@soulcanvas/logic` | Pure functions — canvas node calculations, emotion scoring |
| `@soulcanvas/ui-kit` | Design system components (shared across all apps) |
| `@soulcanvas/typescript-config` | Shared TypeScript path and compiler configs |

## 🚀 Getting Started

> **New developers/AI agents:** Read the [Developer Workflow Guide](./DEVELOPER_WORKFLOW.md) for our 3-layer Git strategy, and the [Setup Guide](./SETUP.md) for complete environment configuration.

```bash
# Install
bun install

# Setup database
cd packages/database && bun run db:push && cd ../..

# Launch all 3 apps
bun run dev
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router + Turbopack) • **React Three Fiber** (3D) • **TanStack Query v5** • **tRPC v11** • **Tailwind CSS** + **Framer Motion** • **Clerk** auth • **Sentry** + **PostHog**

### Backend
- **NestJS** on **Bun** • **tRPC v11** • **Drizzle ORM** (Neon PostgreSQL) • **BullMQ** (Redis job queues) • **Pino** logging • **Sentry** • **Helmet** • **@clerk/backend**

### Admin (Command Center)
- **Next.js 16** • **Clerk RBAC** • **Recharts** • **Socket.io** • **cmdk** (CMD+K palette) • **@tremor/react**

### Tooling
- **Biome** (lint + format, 20x faster than ESLint) • **Turborepo** • **Husky** + **lint-staged** • **Knip**

## 📦 Commands

```bash
bun run dev          # Start all apps
bun run build        # Build all apps
bun run lint         # Biome lint
bun run lint:fix     # Auto-fix
bun run check-types  # TypeScript check

# Database
cd packages/database
bun run db:push      # Push schema
bun run db:studio    # Drizzle Studio
```

## 🎯 Key Features

- **3D Galaxy Canvas** — journal entries visualized as orbiting nodes in a personal 3D space
- **End-to-End Type Safety** — tRPC v11 from database to UI
- **Privacy-First** — AES-256-GCM encryption at rest for all entries
- **AI Integration** — sentiment analysis, reflection prompts, embedding-based search
- **Command Center** — full internal ops dashboard with RBAC, audit logs, telemetry, billing, and GDPR compliance tools
- **Real-time Notifications** — BullMQ background jobs for email (Resend), WhatsApp (Twilio)
- **Rate Limiting** — sliding-window rate limiter on every tRPC route
- **Observability** — Sentry error tracking, PostHog analytics, Pino structured logging

## 📝 Development Philosophy

1. **Type-Safe Bridge** — shared packages ensure compile-time safety across all apps
2. **Modular Evolution** — features isolated in packages for easy extension
3. **Performance First** — Bun runtime + Biome + Turbopack for maximum speed
4. **Security by Default** — Helmet, rate limiting, RBAC, encrypted storage

---

For environment variables, see [SETUP.md](./SETUP.md). For Git workflow, see [DEVELOPER_WORKFLOW.md](./DEVELOPER_WORKFLOW.md).
