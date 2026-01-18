# 🎨 SoulCanvas - Life Journaling App

A beautiful, 3D-first journaling application built with a distributed monorepo architecture.

## 🏗️ Architecture

This is a **Distributed Monorepo** using **Bun + Turborepo** with the following structure:

### Apps

- `@soulcanvas/frontend`: Next.js 14+ app with React Three Fiber for 3D canvas
- `@soulcanvas/backend`: NestJS API server with tRPC for type-safe communication

### Packages

- `@soulcanvas/database`: Drizzle ORM schemas and database client
- `@soulcanvas/api`: Shared tRPC router and client
- `@soulcanvas/ai-engine`: AI prompts, embeddings, and LLM integration
- `@soulcanvas/logic`: Pure functions for canvas calculations and emotion scoring
- `@soulcanvas/ui-kit`: Shared design system components
- `@soulcanvas/ui`: React component library
- `@soulcanvas/typescript-config`: Shared TypeScript configurations
- `@soulcanvas/eslint-config`: ESLint configurations (legacy, migrating to Biome)

## 🚀 Getting Started

### Prerequisites

- **Bun** 1.3.5+ (package manager)
- **bun**  (runtime)
- **PostgreSQL** (database)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd soulcanvas
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database and API keys
```

4. Set up the database:
```bash
cd packages/database
bun run db:push
```

5. Start development servers:
```bash
# From root - starts both frontend and backend
bun run dev

# Or individually:
cd apps/frontend && bun run dev  # Runs on port 3001
cd apps/backend && bun run dev   # Runs on port 3000
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+** (App Router)
- **React Three Fiber** (3D rendering)
- **TanStack Query** (data fetching & caching)
- **tRPC** (end-to-end type safety)
- **Tailwind CSS** + **Framer Motion** (styling & animations)
- **Clerk** (authentication)

### Backend
- **NestJS** (framework)
- **Bun** (runtime - 3x faster than Node.js)
- **tRPC v11** (type-safe API)
- **Drizzle ORM** (database)
- **PostgreSQL** (primary database)

### Development Tools
- **Biome** (linting & formatting - 20x faster than ESLint/Prettier)
- **Turborepo** (monorepo orchestration)
- **Husky** + **lint-staged** (git hooks)
- **Knip** (dead code detection)

## 📦 Package Scripts

### Root Level
- `bun run dev` - Start all apps in development mode
- `bun run build` - Build all apps and packages
- `bun run lint` - Lint all code with Biome
- `bun run lint:fix` - Fix linting issues
- `bun run check-types` - Type-check all packages
- `bun run knip` - Find unused code and dependencies

### Database Package
- `bun run db:generate` - Generate migrations
- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Open Drizzle Studio

## 🎯 Key Features

- **3D Canvas**: Visualize journal entries as connected nodes in 3D space
- **Type Safety**: End-to-end type safety with tRPC
- **Offline-First**: PWA support with TanStack Query persistence
- **AI Integration**: Mood analysis and reflection prompts
- **Privacy-First**: Encryption at rest for journal entries

## 📝 Development Philosophy

1. **Type-Safe Bridge**: Shared packages ensure type safety across frontend and backend
2. **Modular Evolution**: Features are isolated in modules for easy extension
3. **Performance First**: Bun runtime and Biome for maximum speed
4. **Offline-First**: Works without internet connection

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.dev/docs/reference/configuration)
- [CLI Usage](https://turborepo.dev/docs/reference/command-line-reference)
