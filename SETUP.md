# PVG Academy — Project Setup Guide

> Follow these steps in order to set up the project from scratch.
> Every command is explained so you understand what it does, not just what to type.

---

## Prerequisites

- Node.js 20+ installed
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
    branches: [main] # run on every push to main
  pull_request:
    branches: [main] # run on every pull request targeting main

jobs:
  check:
    runs-on: ubuntu-latest # GitHub spins up a fresh Ubuntu VM for every run
    env:
      # GitHub Actions internally uses Node.js to run actions like checkout and
      # setup-node. This forces them to use Node.js 24 (the new default from
      # June 2026). Without this, you get deprecation warnings.
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true

    steps:
      # Step 1: Clone your repo onto the GitHub runner VM
      # Without this the machine has no code to work with
      - uses: actions/checkout@v4

      # Step 2: Install Node.js 24 on the runner
      # cache: npm caches node_modules between runs so installs are faster
      - uses: actions/setup-node@v4
        with:
          node-version: 24 # use Node.js 24 LTS (current long-term support)
          cache: npm

      # Step 3: Install all npm dependencies
      # npm ci is stricter than npm install — uses the exact versions locked in
      # package-lock.json and fails if anything doesn't match
      - run: npm ci

      # Step 4: TypeScript type check
      # tsc --noEmit checks for type errors without producing any output files
      # Fails the build if there are any TypeScript errors
      - name: Typecheck
        run: npm run typecheck

      # Step 5: ESLint
      # Checks code style rules and catches common mistakes
      # Fails if any ESLint rule is violated
      - name: Lint
        run: npm run lint

      # Step 6: Vitest unit tests
      # --run: run once and exit (not watch mode — CI doesn't wait forever)
      # --passWithNoTests: don't fail when there are zero test files yet
      #   (remove this flag once you have at least one test written)
      - name: Unit tests
        run: npm run test -- --run --passWithNoTests
```

**What this does — on every push and pull request:**

1. Spin up a fresh Ubuntu VM on GitHub's servers
2. Install dependencies (exact versions from lockfile)
3. TypeScript typecheck
4. ESLint
5. Vitest unit tests

If any step fails → deploy is blocked, you get an email.

```bash
git add .
git commit -m "chore: add GitHub Actions CI workflow"
git push
```

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

## Tech Stack Reference

Every tool in this project, what it does, and how we actually use it.

---

### Next.js 15 (App Router)

**What it is:** A React framework that adds file-based routing, server-side rendering, and API routes on top of React.

**Why we use it:** React alone is just a UI library — it doesn't handle routing, API calls, or deployment. Next.js gives you all of that with almost zero configuration.

**How we use it:**

| Folder                        | Purpose                                       |
| ----------------------------- | --------------------------------------------- |
| `app/page.tsx`                | Home page — the track picker                  |
| `app/tracks/[track]/page.tsx` | Dynamic route — `[track]` becomes a URL param |
| `app/api/`                    | API endpoints — called by the frontend        |

**Key concept — Server Components vs Client Components:**

- By default every component is a Server Component — it runs on the server, sends HTML to the browser. No JavaScript in the bundle.
- Add `"use client"` at the top of a file when it needs interactivity (state, event listeners, browser APIs like localStorage).
- Rule of thumb: default to Server Components, add `"use client"` only when you must.

```tsx
// Server Component (default) — runs on server, no "use client"
// Good for: fetching data, reading files, rendering static content
export default async function TrackPage() {
  const lessons = await getLessons(); // runs on server
  return (
    <ul>
      {lessons.map((l) => (
        <li>{l.title}</li>
      ))}
    </ul>
  );
}

// Client Component — runs in browser
// Good for: useState, onClick, localStorage, Monaco editor
("use client");
export default function QuizComponent() {
  const [answer, setAnswer] = useState("");
  return <input onChange={(e) => setAnswer(e.target.value)} />;
}
```

---

### TypeScript

**What it is:** JavaScript with type annotations. You declare what shape your data has, and TypeScript catches mismatches before your code runs.

**Why we use it:** JavaScript lets you pass anything to any function — bugs only appear at runtime. TypeScript catches them at compile time, in your editor, before users see them.

**How we use it:**

```ts
// lib/types.ts — define all shapes here first
export interface Lesson {
  id: string;
  title: string;
  track: string;
  order: number;
}

// Functions declare what they accept and return
function getLesson(id: string): Lesson { ... }
//                     ↑             ↑
//               parameter type   return type

// TypeScript catches mistakes immediately
getLesson(42); // ❌ Error: Argument of type 'number' is not assignable to 'string'
```

**Key utility types we use:**

```ts
// Partial<T> — makes all fields optional (useful for update operations)
function updateLesson(id: string, changes: Partial<Lesson>) { ... }
updateLesson("1", { title: "New Title" }); // ✅ don't need all fields

// Pick<T, Keys> — take only specific fields from a type
type LessonSummary = Pick<Lesson, "id" | "title">;
// Result: { id: string; title: string } — order and track are gone

// Omit<T, Keys> — remove specific fields from a type
type NewLesson = Omit<Lesson, "id">;
// Result: { title: string; track: string; order: number } — id removed
```

---

### Tailwind CSS

**What it is:** A CSS framework where you style elements by adding utility classes directly in your HTML/JSX.

**Why we use it:** Traditional CSS requires switching between files and inventing class names. Tailwind lets you style directly in JSX — faster, consistent, and self-documenting.

**How we use it:**

```tsx
// Traditional CSS approach — two files, context switching
// styles.css: .card { padding: 16px; background: white; border-radius: 8px; }
// component.tsx: <div className="card">...</div>

// Tailwind approach — everything in one place
<div className="p-4 bg-white rounded-lg shadow">
  <h2 className="text-xl font-bold text-gray-900">TypeScript Track</h2>
  <p className="mt-2 text-gray-600">12 lessons</p>
</div>
```

**Common classes used in this project:**

```
Layout:     flex, grid, flex-col, items-center, justify-between, gap-4
Spacing:    p-4 (padding), m-2 (margin), px-6 py-3 (x/y only)
Size:       w-full, h-screen, max-w-4xl
Colors:     bg-white, text-gray-900, border-gray-200
Typography: text-xl, font-bold, leading-relaxed
Effects:    rounded-lg, shadow, hover:bg-blue-600, transition
```

---

### ESLint

**What it is:** A static analysis tool that scans your code for problems without running it.

**Why we use it:** Catches real bugs (using a variable before declaring it), bad patterns (missing dependency arrays in `useEffect`), and style issues — before the code ever runs.

**How we use it:**

```bash
npm run lint          # check all files, show errors
npm run lint -- --fix # auto-fix everything it can
```

**In this project, ESLint runs automatically:**

- Before every `git commit` (via Husky + lint-staged)
- On every push and pull request (via GitHub Actions)

You can never push code with lint errors unless you deliberately bypass it.

---

### Prettier

**What it is:** An opinionated code formatter. It takes your code and reprints it in a consistent style — indentation, quotes, line length, spacing.

**Why we use it:** Every developer formats code slightly differently. Prettier removes all formatting decisions — there is one correct format and it's enforced automatically.

**How we use it:**

```bash
npm run format   # reformat every file in the project
```

**In this project, Prettier runs automatically:**

- Before every `git commit` on files you staged (via lint-staged)
- This means you never commit poorly formatted code

**Config (`.prettierrc`):**

```json
{}
```

Empty object = use Prettier's defaults: double quotes, semicolons, 2-space indent, 80-character line width. These are sensible defaults used by most JS/TS projects.

---

### Husky + lint-staged

**What they are:**

- **Husky** hooks into git events and runs a script at a specific point (before commit, before push, etc.)
- **lint-staged** runs a command only on the files that are staged for the current commit — not the whole project

**Why we use them together:** You want ESLint and Prettier to run before every commit. But running them on the whole project for a single file change is slow. lint-staged makes it fast by scoping to only changed files.

**How it works (`.husky/pre-commit` + lint-staged config in `package.json`):**

```
You run: git commit -m "fix: button color"
         ↓
Husky triggers: runs lint-staged
         ↓
lint-staged checks: which files are staged?
         ↓
Only staged .ts/.tsx files → eslint --fix → prettier --write
Only staged .json/.md/.css files → prettier --write
         ↓
If any errors remain after auto-fix → commit is blocked
If all clean → commit goes through
```

---

### Vitest + React Testing Library

**What they are:**

- **Vitest** — the test runner. Finds test files, executes them, reports pass/fail, watches for changes.
- **React Testing Library (RTL)** — adds browser simulation and DOM matchers so you can render and interact with React components in tests.

**Why we use them:** Tests catch regressions — when you add a feature and accidentally break something else. Vitest is fast (much faster than Jest). RTL encourages testing what users see, not implementation details.

**How we use them:**

```ts
// __tests__/progress.test.ts — testing a plain function (Vitest only)
import { describe, it, expect } from "vitest";
import { markComplete, isComplete } from "@/lib/progress";

describe("progress", () => {
  it("marks a lesson as complete", () => {
    markComplete("lesson-1");
    expect(isComplete("lesson-1")).toBe(true);
  });
});
```

```tsx
// __tests__/LessonCard.test.tsx — testing a React component (Vitest + RTL)
import { render, screen } from "@testing-library/react";
import LessonCard from "@/components/LessonCard";

it("shows lesson title", () => {
  render(<LessonCard title="Basic Types" />);
  expect(screen.getByText("Basic Types")).toBeInTheDocument();
});
```

```bash
npm run test            # watch mode — re-runs on file changes
npm run test -- --run   # run once and exit (used in CI)
npm run test:coverage   # run with coverage report
```

---

### Playwright

**What it is:** A browser automation framework. It opens a real Chromium/Firefox/WebKit browser and clicks through your app exactly like a human user would.

**Why we use it:** Unit tests (Vitest) test functions and components in isolation. They can't catch "the whole page breaks when you navigate from /tracks to /lesson". Playwright catches those end-to-end regressions.

**How we use it:**

```ts
// e2e/tracks.spec.ts
import { test, expect } from "@playwright/test";

test("user can navigate from home to a lesson", async ({ page }) => {
  await page.goto("/"); // open home page
  await page.click("text=TypeScript Track"); // click a button
  await expect(page).toHaveURL("/tracks/typescript"); // assert URL changed
  await expect(page.getByText("Basic Types")).toBeVisible(); // assert content
});
```

```bash
npm run test:e2e                  # run all E2E tests (headless)
npx playwright test --ui          # run with visual browser (debugging)
npx playwright show-report        # open last test report in browser
```

---

### GitHub Actions

**What it is:** A CI/CD (Continuous Integration / Continuous Deployment) platform built into GitHub. You write a YAML file describing what to run, and GitHub runs it automatically on every push.

**Why we use it:** Without CI, broken code gets merged silently. With CI, every push is automatically checked — typecheck, lint, tests — before it can be deployed.

**How the pipeline works:**

```
Developer pushes to GitHub
         ↓
GitHub Actions spins up a fresh Ubuntu VM
         ↓
Runs: npm ci → typecheck → lint → test
         ↓
All pass?    → Vercel auto-deploys
Any failure? → Deploy blocked, email sent to developer
```

**The workflow file** is at `.github/workflows/ci.yml`. GitHub reads this file automatically — no dashboard setup needed.

---

### Vercel

**What it is:** A hosting platform built specifically for Next.js. Connect your GitHub repo and every push to `main` auto-deploys. Every pull request gets its own preview URL.

**Why we use it:** Free tier, zero configuration for Next.js, automatic HTTPS, global CDN, and preview deployments on every PR. The team can review a PR visually before merging.

**How the deploy flow works:**

```
Push to main branch
       ↓
GitHub Actions CI runs (typecheck, lint, tests)
       ↓
All checks pass
       ↓
Vercel auto-deploys to production
       ↓
https://pvg-academy.vercel.app is updated
```

**Pull request previews:**

```
Open a pull request
       ↓
Vercel automatically builds a preview deployment
       ↓
A unique URL like https://pvg-academy-git-feature-xyz.vercel.app is posted
       ↓
Team reviews the actual working app before merging
```

---

_Last updated: April 2026_
