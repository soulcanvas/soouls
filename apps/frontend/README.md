# 🎨 @soulcanvas/frontend

Next.js 16 frontend app — 3D galaxy canvas, journaling UI, and full user experience.

## 🚀 Quick Start

```bash
# From root
bun install && bun run dev

# Or directly
cd apps/frontend && bun run dev
```

Open [http://localhost:3001](http://localhost:3001).

## 🏗 Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **3D Canvas** | React Three Fiber (`@react-three/fiber`, `@react-three/drei`) |
| **Styling** | Tailwind CSS + Framer Motion |
| **Data** | TanStack Query v5 + tRPC v11 |
| **Auth** | Clerk (`@clerk/nextjs`) |
| **Analytics** | PostHog + Vercel Analytics + Speed Insights |
| **Monitoring** | Sentry (`@sentry/nextjs`) |

## 📂 Key Directories

```
app/
├── dashboard/          # Core app after login
│   ├── new-entry/      # Journal entry creator with drawing canvas
│   └── calendar/       # Calendar view
├── sign-in/            # Clerk authentication
├── sign-up/            # Clerk registration
└── layout.tsx          # Root layout with providers

src/
├── utils/trpc.ts       # tRPC client (with masquerade header injection)
├── providers/          # PostHog, theme, query providers
└── components/         # App-specific UI components
```

## ⚡ Performance

- **LZ-String Compression:** Large JSON payloads decompressed client-side
- **`useMemo` Optimizations:** Heavy 3D data processing is memoized
- **Turbopack:** Fast HMR in development
- **Sentry Instrumentation:** Server + client + edge error tracking

## 🔗 Environment Variables

All shared from root `.env`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
NEXT_PUBLIC_BACKEND_URL
NEXT_PUBLIC_SENTRY_DSN
NEXT_PUBLIC_POSTHOG_KEY
```

---
*See [SETUP.md](../../SETUP.md) for full env reference. See [DEVELOPER_WORKFLOW.md](../../DEVELOPER_WORKFLOW.md) for Git workflow.*
