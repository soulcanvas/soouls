---
name: soulcanvas-git-workflow
description: Enforce the 3-layer Git workflow for the SoulCanvas project. Always use this when starting a new task, submitting code, or interacting with git branches.
---

# SoulCanvas Git Workflow Skill

You are working on the SoulCanvas codebase, which enforces a strict 3-tier Git branching strategy.
**CRITICAL:** As an AI agent, you must NEVER commit or push directly to the `main` or `dev` branches.

## The 3 Branches Strategy

1.  **`main` (Production):** The production-ready code. Never push here.
2.  **`dev` (Integration/Staging):** The primary development branch. All PRs target this branch.
3.  **`<your-name>/<feature-name>` (Feature Branches):** Where all actual work happens.

---

## 🚀 The AI Developer Workflow

Whenever the user asks you to start working on a new feature, bug fix, or task, you MUST follow this exact sequence of git commands before writing any code:

### Step 1: Always Start from `dev`
You must pull the absolute latest code from the `dev` branch.
```bash
git checkout dev
git pull origin dev
```

### Step 2: Create a Feature Branch
Create a new branch with a descriptive name, prefixed with a name (e.g., `ai/` or the user's name).
```bash
git checkout -b your-name/feature-description
```

### Step 3: Write the Code
Proceed with making changes to the codebase, following all standard architectural rules.

### Step 4: Commit and Push
Once your changes are thoroughly tested and complete:
```bash
git add .
git commit -m "feat: descriptive commit message"
git push origin your-name/feature-description
```

### Step 5: Raise a PR
Instruct the user (or use a CLI tool if available) to open a Pull Request from `your-name/feature-description` into `dev`.
*   **Target branch:** `dev`
*   **Reviewers:** Lead Developer or CTO

---

## Rules to Remember:
- **Never** develop directly on `main` or `dev`.
- **Always** sync `dev` before creating a new branch.
- **Never** skip the PR process.
