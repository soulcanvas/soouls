# SoulCanvas Git Workflow & Onboarding

Welcome to the SoulCanvas codebase! This guide covers everything a new developer needs to know to start contributing, focusing heavily on our 3-layer Git workflow.

## 🌟 The 3-Layer Git Workflow

We use a strict 3-tier branching strategy to ensure code quality and stability.

1.  **`main` (Production):**
    *   This is the production-ready code.
    *   **NEVER PUSH DIRECTLY TO `main`!**
    *   Code on `main` is what goes out for deployment to our end users.

2.  **`dev` (Integration / Staging):**
    *   This is the active development and integration branch.
    *   All new features and bug fixes merge into `dev` first.
    *   This is the branch that QA and automated tests run against before a release.
    *   Once `dev` is thoroughly tested and ready for production, the Lead/CTO will merge it into `main`.

3.  **`<your-name>/<feature-name>` (Feature Branches):**
    *   This is where **you** work.
    *   Every time you pick up a task, you will create a branch under your name (e.g., `alice/new-dashboard-ui` or `bob/fix-auth-bug`).
    *   Always branch off from the latest `dev` branch.

### 🏃‍♂️ Day-to-Day Developer Flow

When you start working on a new feature or task, follow these exact steps:

**1. Update your local `dev` branch:**
Make sure you have the absolute latest code before starting.
```bash
git checkout dev
git pull origin dev
```

**2. Create your personal feature branch:**
Create your branch using the format `yourname/feature-description`.
```bash
git checkout -b yourname/my-awesome-feature
```

**3. Write Code & Commit:**
Write your amazing code! Make sure to follow the architecture guidelines in the main README.
```bash
git add .
git commit -m "feat: added my awesome feature"
```

**4. Push your branch to GitHub:**
```bash
git push origin yourname/my-awesome-feature
```

**5. Raise a Pull Request (PR):**
*   Go to GitHub.
*   Open a Pull Request from `yourname/my-awesome-feature` 👉 merging into `dev` (NOT `main`).
*   Request review from the Lead Developer or CTO.

**6. Review & Merge:**
*   The Lead/CTO will review your code. Apply any requested changes by pushing updates to your branch.
*   Once approved, the Lead/CTO will merge the PR into `dev`.

**7. Moving to Production:**
*   The team tests the `dev` branch.
*   The Lead/CTO handles merging `dev` into `main` for deployment.

---

## 🛠 Project Setup & Onboarding Basics

### Quick Start
1.  Clone the repository.
2.  Install dependencies: `bun install`
3.  Set up env vars: `cp .env.example .env` (see [SETUP.md](./SETUP.md) for all vars)
4.  Push database schema: `cd packages/database && bun run db:push`
5.  Start dev servers: `bun run dev` (starts frontend:3001, backend:3000, admin:3002)

### Important Commands
*   **Database Migrations:** `cd packages/database && bun run db:push`
*   **Format & Lint:** `bun run lint` (Biome — blazing fast)
*   **Type Check:** `bun run check-types`
*   **Dead Code Detection:** `bun run knip`

### Apps Overview
| App | Port | URL |
|-----|------|-----|
| Frontend | 3001 | `http://localhost:3001` |
| Backend (NestJS) | 3000 | `http://localhost:3000` |
| Admin Dashboard | 3002 | `http://localhost:3002` |

### AI Agent Skills & Workflows
The project includes `.agents/skills/` and `.agent/skills/` directories with specialized AI instructions for architecture, API security, frontend design, Git workflow, and more. If you are an AI agent, these files provide the exact paradigms used by the SoulCanvas team.

Enjoy building SoulCanvas!
