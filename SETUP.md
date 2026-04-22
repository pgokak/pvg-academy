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
Without it, every developer formats code differently — git shows noise changes.

```bash
# Install Prettier as a dev dependency
npm install --save-dev prettier
```

```bash
# Create Prettier config — empty braces means use defaults
# Defaults: double quotes, semicolons, 2-space indent, 80 char line width
echo '{}' > .prettierrc
```

```bash
# Tell Prettier which folders to skip
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
# Should list every file it touched
```

---

## Step 3: Install and Configure Husky + lint-staged

Husky runs scripts automatically before git commits.
lint-staged runs those scripts only on files you changed (not the whole project).

Together they ensure nobody can commit badly formatted or broken code.

```bash
# Install both packages
npm install --save-dev husky lint-staged
```

```bash
# Set up Husky — creates .husky/ folder
#This creates a .husky/ folder in your project with a default pre-commit file. The pre-commit file is a shell script that runs automatically every time you type git commit.
npx husky init
```

```bash
# Replace the default pre-commit hook with our own
#This replaces the default content in .husky/pre-commit with npx lint-staged — so every commit automatically runs lint-staged.

echo "npx lint-staged" > .husky/pre-commit
```

**Add lint-staged config to `package.json`:**
#Open package.json and add this block at the end, before the closing }:

```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

- On `.ts` and `.tsx` files: fix ESLint issues, then format with Prettier
- On `.json`, `.md`, `.css` files: just format with Prettier

**Verify it works:**

```bash
# Make a small change to any file, then commit
git add .
git commit -m "test: verify husky runs"
# Should see lint-staged running before the commit completes
```

---

/\* Step 3 complete.

Here's what we've done so far:

✅ Step 1 Next.js app scaffolded and running
✅ Step 2 CLAUDE.md + ARCHITECTURE.md + SETUP.md created
✅ Step 3 Prettier installed and configured
✅ Step 4 Husky + lint-staged — bad code can't be committed
⬜ Step 5 Create folder structure
⬜ Step 6 Vitest (unit testing)
⬜ Step 7 Playwright (E2E testing)
⬜ Step 8 Push to GitHub
⬜ Step 9 Connect Vercel
⬜ Step 10 GitHub Actions CI/CD
\*/

## Step 4: Create Folder Structure

```bash
# Create all project folders at once
mkdir -p content/typescript/01-basic-types
mkdir -p components/editor components/quiz components/layout
mkdir -p lib/services
mkdir -p __tests__
mkdir -p e2e
```

**Create placeholder files so git tracks the folders:**

#Why this is needed:
Git does not track empty folders — only files. .gitkeep is a convention (empty file with no content) just to make git aware the folder exists. The lib/ files are placeholders we'll fill in later.

```bash
touch lib/types.ts
touch lib/progress.ts
touch lib/content.ts
touch lib/api.ts
touch lib/tracks.ts
touch lib/services/.gitkeep
```

---

#Verify the structure looks right:
#find . -not -path "_/node_modules/_" -not -path "_/.git/_" -not -path "_/.next/_" | sort

## Step 5: Install and Configure Vitest

#Testing a plain function → Vitest only
Testing a React component → Vitest + RTL together
#Vitest is the test runner — it finds your test files, runs them, and tells you pass/fail. Think of it as the engine.

#React Testing Library (RTL) is a set of helper functions specifically for testing React components — it lets you render a component and interact with it like a user would.

Vitest is the unit testing framework. Faster than Jest, built for modern Next.js.

```bash
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

**Create `vitest.config.ts` at project root:**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./__tests__/setup.ts",
  },
});
```

**Create `__tests__/setup.ts`:**

```ts
import "@testing-library/jest-dom";
```

**Add test script to `package.json`:**

```json
"test": "vitest", ** — runs Vitest in watch mode (re-runs on file save) **
"test:coverage": "vitest run --coverage" **— runs once and shows how much of your code is covered by tests **
```

**Verify it works:**

```bash
npm run test
# Should start Vitest in watch mode
```

---

## Step 6: Install and Configure Playwright

Playwright runs end-to-end tests — it opens a real browser and interacts with your app like a user.
itest tests functions and components in isolation — no browser.
Playwright opens a real browser and clicks through your app like a real user.

Vitest → "does progress.complete() work?"
Playwright → "can a user open a lesson, write code, submit quiz, and see progress saved?"
Both are needed. Vitest is fast (milliseconds). Playwright is slower but catches things unit tests miss — broken layouts, navigation issues, real browser behavior.

```bash
npm install --save-dev @playwright/test

#This downloads Chromium, Firefox and WebKit (Safari engine) onto your machine. Playwright uses these to run your tests in real browsers.
#This may take 1-2 minutes — it's downloading browser binaries. Run it and come back.
npx playwright install
```

**Create `playwright.config.ts` at project root:**

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

**Add e2e script to `package.json`:**

```json
"test:e2e": "playwright test"
```

---

## Step 7: Push to GitHub

```bash
# Create a new repo on github.com first (name: pvg-academy), then:
git remote add origin https://github.com/YOUR_USERNAME/pvg-academy.git
git add .
git commit -m "feat: initial project setup with Next.js, Tailwind, Prettier, Husky"
git push -u origin main
```

---

## Step 8: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Select the `pvg-academy` repository
4. Leave all settings as default — Vercel auto-detects Next.js
5. Click **Deploy**

Every future push to `main` will auto-deploy.
Every pull request will get a unique preview URL.

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

**What this does:**
On every push and pull request:

1. Installs dependencies
2. Runs TypeScript typecheck
3. Runs ESLint
4. Runs Vitest unit tests
5. Runs Playwright E2E tests

If any step fails — the PR is blocked from merging.

---

## Quick Reference — All Commands

```bash
npm run dev          # start dev server
npm run build        # production build
npm run typecheck    # TypeScript check (no output files)
npm run lint         # ESLint check
npm run format       # Prettier format all files
npm run test         # Vitest unit tests (watch mode)
npm run test:e2e     # Playwright E2E tests
```

---

_Last updated: April 2026_
