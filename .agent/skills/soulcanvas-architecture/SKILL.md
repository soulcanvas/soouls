---
name: soulcanvas-architecture
description: Technical Architecture and Design guidelines for the SoulCanvas project.
---

# **🚀 Technical Design: Journaling app**

**Architecture Style:** Distributed Monorepo (Bun + Turborepo Workspaces)

---

## **1. System High-Level Overview**
The system is divided into **"The Shells"** (Platforms users touch) and **"The Core"** (Shared logic and data).
- **Platform Shells:** Next.js (Web), Expo (Mobile), Tauri (Desktop).
- **The Core Logic:** Shared TypeScript packages for Database, API Client, and Types.
- **The Data Engine:** NestJS Backend + PostgreSQL + Vector Search (AI).
- **Communication:** **tRPC** (End-to-End Type Safety). 
- **The Orchestrator:** **Turborepo**.

## 🛰️ 2. Architecture: The "Edge-Heavy" Monorepo
- **API Protocol:** Upgrade tRPC to **tRPC v11** with **Standard Schema** (using `ArkType` or `Valibot`).
- **The "Core" Package:** Add a `packages/logic` folder for "Pure Functions" running in both Browser and Server for **Optimistic UI**.

## **4. The Frontend Architecture (The Canvas)**
- **Framework:** Next.js 14+ (App Router).
- **Rendering Engine:** **React Three Fiber (Three.js)**.
- **Styling:** Tailwind CSS + Framer Motion.
- **State Management:** **TanStack Query (v5)**.
- **Offline-First (PWA):** Use **TanStack Query + Persist.**
- **Micro-Animations:** Use **Rive**.

## 🎨 5. Frontend: The "Performance Art" Engine
- **Rendering:** Move heavy calculations to **Web Workers**.
- **Asset Pipeline:** Use **Cloudflare Image Optimization**.
- **Shaders:** Use **Custom GLSL Shaders** for the "Luminous" effect.

## **6. The Backend Architecture (The Reflection Engine)**
- **Runtime:** **Bun**.
- **Framework:** **NestJS**.
- **Auth:** **NextAuth.js** or **Clerk**.
- **API Protocol:** **tRPC**.
- **Security (Encryption at Rest):** **AES-256 bit encryption**.

### **Key Modules:**
1. **Canvas Module:** Calculates "Distance" between nodes.
2. **AI Module:** Interfaces with OpenAI/Anthropic.
3. **Scrapbook Module:** Manages binary uploads to S3 buckets.

## **7. The Data Layer (The Memory)**
### **1. Relational DB (PostgreSQL + Drizzle ORM / Neon Serverless Postgres)**
### **2. Vector Database (Pinecone or pgvector)**
### **3. Cache Layer (Redis)**
### **4. Search: Meilisearch**
### **5. AI & Analytics: MindsDB**

## 🧠 AI: The "Hybrid Brain" (Privacy-First)
1. **Tier 1 (Local):** Use **Transformers.js** or **Wasm-based Embeddings** inside the browser/app. The "Meaning" of the journal is calculated *on-device*.
2. **Tier 2 (Private Cloud):** Store vectors in **pgvector**.
3. **Tier 3 (LLM):** Send *anonymized* snippets to Anthropic/OpenAI.

## 🛡️ Security: The "Journal Sanctuary" 2.0
- **End-to-End Encryption (E2EE):** Use the **Web Crypto API**. Encrypt the text using a key derived from the user's password *before* it leaves their device.

## **7. Project Directory (Monorepo Map)**
/life-canvas
├── apps/
│   ├── web/             # Next.js
│   ├── api/             # NestJS
│   └── mobile/          # Expo
├── packages/
│   ├── database/        # Drizzle schemas
│   ├── ai-engine/       # Prompt templates & LLM logic
│   ├── ui-kit/          # Design system
│   └── config/          # Shared biome /TS configs
├── package.json         # Root workspace config
└── bun.lockb            # Single lockfile

## **1. Quality & Consistency**
- **Biome (instead of ESLint/Prettier)**
- **Husky + lint-staged**
- **Knip**

## **Observability & Ops**
- **Sentry**, **PostHog**, **Logtail (Better Stack)**.
- **Drizzle Studio**, **Uploadthing**, **Resend + React Email**.
- **Infisical**, **Snyk**, **Cloudflare Turnstile**.
