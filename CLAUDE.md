# PVG Academy — Claude Instructions

## Project Purpose

A multi-track developer learning platform for Prashant's team.
Covers TypeScript, React, Node.js, SQL, Spring Boot, Kafka, Docker, AWS, DevOps.
Built to be production-ready and expandable over time.

## Commands

```bash
npm run dev        # start dev server (http://localhost:3000)
npm run build      # production build
npm run typecheck  # type-check without emitting
npm run lint       # ESLint
npm run format     # Prettier
npm run test       # Vitest unit tests
npm run test:e2e   # Playwright E2E tests
```

## Architecture

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Monaco Editor · localStorage → PostgreSQL (Neon) later · NextAuth.js later · Prisma later

**Data flow:**

- `lib/progress.ts` — localStorage abstraction. Never call localStorage directly from components. When DB is added later, only this file changes.
- `lib/content.ts` — reads and parses markdown lesson files from /content/
- `lib/api.ts` — single API client using `NEXT_PUBLIC_API_URL` env var. Swap to Spring Boot backend later by changing one env variable.
- `lib/services/` — all business logic lives here. API routes and Server Actions are thin — they call services, nothing else.
- `lib/types.ts` — all shared TypeScript interfaces

**Content structure** (non-developers edit here, no React knowledge needed):

```
/content/[track]/[lesson-number]-[lesson-name]/
  lesson.md       — explanation (markdown)
  starter.ts      — Monaco editor starting code
  solution.ts     — answer
  quiz.json       — questions array
```

**Adding a new track:**

1. Create folder under `/content/[track-name]/`
2. Add track metadata to `lib/tracks.ts`
3. Add lessons as subfolders with lesson.md + starter.ts + quiz.json

## Key Conventions

- **Service layer is mandatory** — never put business logic in API routes or Server Actions
- **Progress abstraction** — always use `lib/progress.ts`, never `localStorage` directly
- **API client** — always use `lib/api.ts`, never raw `fetch` calls in components
- **Types first** — define interfaces in `lib/types.ts` before writing functions
- **Tailwind only** — no inline styles, no CSS modules (except globals.css)
- **Server Components by default** — only add `"use client"` when you need interactivity

## Folder Structure

```
/app                          Next.js routes
/content                      Markdown lessons (non-developers work here)
/components                   Shared UI components
  /editor/                    Monaco editor wrapper
  /quiz/                      Quiz engine
  /layout/                    Nav, sidebar, header
/lib
  /services/                  Business logic (no UI)
  progress.ts                 localStorage abstraction
  content.ts                  Markdown file reader
  api.ts                      Single API client
  tracks.ts                   Track metadata registry
  types.ts                    Shared TypeScript interfaces
/public                       Static assets
```

## Roadmap

```
Phase 1 (now)     TypeScript track · localStorage · Vercel deployment
Phase 2           React + Node.js tracks · PostgreSQL · NextAuth.js
Phase 3           Spring Boot microservices backend (separate repo: pvg-academy-backend)
Phase 4           Kubernetes + AWS + Terraform (separate repo: pvg-academy-infra)
```
