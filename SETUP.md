# PVG Academy — Project Setup Guide

> Follow these steps in order to set up the project from scratch.
> Every command is explained so you understand what it does, not just what to type.

---

## Prerequisites

- Node.js 18+ installed
- npm installed
- Git installed
- A GitHub account

---

## Step 1: Scaffold the Next.js App

```bash
cd /Users/prashantgokak/Documents/Projects
npx create-next-app@latest pvg-academy --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm
```

**What each flag does:**

- `--typescript` — use TypeScript instead of JavaScript
- `--tailwind` — install and configure Tailwind CSS
- `--eslint` — install and configure ESLint
- `--app` — use App Router (modern Next.js, not the old Pages Router)
- `--no-src-dir` — keep `app/` at root, no extra `src/` wrapper
- `--import-alias "@/*"` — lets you write `@/lib/types` instead of `../../lib/types`
- `--use-npm` — use npm as package manager

**Verify it works:**

```bash
cd pvg-academy
npm run dev
# Open http://localhost:3000 — should see default Next.js page
```

---

## Step 2: Install and Configure Prettier

Prettier enforces consistent code formatting across the whole team.
Without it, every developer formats code differently — git shows noisy diffs.

```bash
# Install Prettier as a dev dependency
# --save-dev means it's a dev tool only, not shipped to production
npm install --save-dev prettier
```

```bash
# Create Prettier config — empty braces means use defaults
# Defaults: double quotes, semicolons, 2-space indent, 80 char line width
echo '{}' > .prettierrc
```

```bash
# Tell Prettier which folders to skip (generated/third-party code)
echo "node_modules
.next
public" > .prettierignore
```

**Add scripts to `package.json`:**

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "format": "prettier --write .",
  "typecheck": "tsc --noEmit"
}
```

- `format` — rewrites all files to match Prettier rules
- `typecheck` — checks TypeScript types without building (used in CI)

**Verify it works:**

```bash
npm run format
# Lists every file it touched
```

---

## Step 3: Install and Configure Husky + lint-staged

**Why:** Husky runs a script automatically before every git commit.
lint-staged runs that script only on files you changed, not the whole project.
Together they make it impossible to commit badly formatted or broken code.

```bash
# Install both packages
npm install --save-dev husky lint-staged
```

```bash
# Set up Husky — creates .husky/ folder with a pre-commit hook file
# The pre-commit file runs automatically every time you type git commit
npx husky init
```

```bash
# Replace default hook content with lint-staged
echo "npx lint-staged" > .husky/pre-commit
```

**Add lint-staged config to `package.json`** (before the closing `}`):

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

- On `.ts/.tsx/.js/.jsx` files: ESLint fixes issues first, then Prettier formats
- On `.json`, `.md`, `.css` files: Prettier formats only
- Files you didn't change: skipped entirely

**Verify it works:**

```bash
git add .
git commit -m "chore: add Prettier and Husky"
# Should see lint-staged output before the commit completes
```

---

## Step 4: Create Folder Structure

**Why:** Git does not track empty folders — only files. We create placeholder
files so git knows these folders exist. The `lib/` files will be filled in later.

```bash
# Create all project folders
mkdir -p content/typescript/01-basic-types
mkdir -p components/editor components/quiz components/layout
mkdir -p lib/services
mkdir -p __tests__
mkdir -p e2e
```

```bash
# Create placeholder files so git tracks the empty folders
# .gitkeep is a convention — an empty file just to mark the folder
touch lib/types.ts lib/progress.ts lib/content.ts lib/api.ts lib/tracks.ts lib/services/.gitkeep
```

```bash
git add .
git commit -m "chore: create project folder structure"
```

---

## Step 5: Install and Configure Vitest

**Why two packages — Vitest vs React Testing Library (RTL)?**

- **Vitest** is the test runner — finds test files, runs them, reports pass/fail
- **RTL** adds helpers for testing React components (render, click, check DOM)
- Testing a plain function → Vitest only
- Testing a React component → Vitest + RTL together

```bash
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

**Create `vitest.config.ts` at project root:**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()], // tells Vitest how to handle JSX/TSX
  test: {
    environment: "jsdom", // simulates browser DOM so React can render
    globals: true, // use test()/expect() without importing them
    setupFiles: "./__tests__/setup.ts",
  },
});
```

**Create `__tests__/setup.ts`:**

```ts
import "@testing-library/jest-dom";
// Adds matchers like toBeInTheDocument(), toHaveText(), toBeVisible()
// Without this, those matchers throw "is not a function"
```

**Add to `package.json` scripts:**

```json
"test": "vitest",
"test:coverage": "vitest run --coverage"
```

**Verify it works:**

```bash
npm run test
# No test files yet — shows "No test files found, re-running on changes..."
# Press q to quit
```

```bash
git add .
git commit -m "chore: add Vitest and React Testing Library"
```

---

## Step 6: Install and Configure Playwright

**Vitest vs Playwright:**

- Vitest tests functions and components in isolation — no browser, milliseconds
- Playwright opens a real browser and clicks through the app like a real user
- Both needed: Vitest is fast, Playwright catches what unit tests miss

```bash
npm install --save-dev @playwright/test

# Downloads Chromium, Firefox, WebKit (Safari engine) — takes 1-2 minutes
npx playwright install
```

**Create `playwright.config.ts` at project root:**

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e", // look for tests in /e2e folder
  use: {
    baseURL: "http://localhost:3000", // write page.goto("/tracks") not full URL
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI, // reuse local server, fresh in CI
  },
});
```

**Add to `package.json` scripts:**

```json
"test:e2e": "playwright test"
```

**Verify it works:**

```bash
npm run test:e2e
# No tests yet — shows "No tests found"
```

```bash
git add .
git commit -m "chore: add Playwright for E2E testing"
```

---

## Step 7: Push to GitHub

1. Go to github.com → New repository
2. Name it `pvg-academy`, set to Public
3. Do NOT add README or .gitignore (we already have them)
4. Click Create repository

```bash
cd /Users/prashantgokak/Documents/Projects/pvg-academy

# Link local project to GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/pvg-academy.git

# Rename branch to main (GitHub default)
git branch -M main

# Push all commits — -u sets upstream so future git push needs no flags
git push -u origin main
```

---

## Step 8: Connect to Vercel

1. Go to vercel.com and sign in with GitHub
2. Click **Add New Project**
3. Select the `pvg-academy` repository
4. Leave all settings as default — Vercel auto-detects Next.js
5. Click **Deploy**

Every future push to `main` auto-deploys.
Every pull request gets a unique preview URL.

---

## Step 9: Set Up GitHub Actions CI/CD

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm run test -- --run

      - name: E2E tests
        run: npm run test:e2e
```

**What this does — on every push and pull request:**

1. Install dependencies (`npm ci` is stricter than `npm install` — uses exact lockfile)
2. TypeScript typecheck
3. ESLint
4. Vitest unit tests
5. Playwright E2E tests

If any step fails → deploy is blocked, you get an email.

---

## Quick Reference — All Commands

```bash
npm run dev            # start dev server (http://localhost:3000)
npm run build          # production build
npm run typecheck      # TypeScript check, no output files
npm run lint           # ESLint check
npm run format         # Prettier — format all files
npm run test           # Vitest unit tests (watch mode)
npm run test:coverage  # Vitest with coverage report
npm run test:e2e       # Playwright E2E tests
```

---

_Last updated: April 2026_
