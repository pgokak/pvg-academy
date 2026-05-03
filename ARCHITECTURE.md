# PVG Academy — Architecture Decision Record

> Every decision here was made before writing a single line of code.
> This document explains the thinking behind the architecture so any team
> member can understand WHY things are built the way they are.

---

## 1. What Are We Building?

A multi-track developer learning platform for a team new to TypeScript.
Eventually covers: TypeScript, React, Node.js, SQL, Spring Boot, Kafka, Docker, AWS, DevOps.

**Four characteristics that drove every decision:**

| Characteristic     | Impact                                                 |
| ------------------ | ------------------------------------------------------ |
| Content-heavy      | Lessons must be easy to write — markdown, not code     |
| Interactive        | In-browser code editor + quizzes + real-time feedback  |
| Multi-user (later) | Design for auth/DB now, implement later                |
| Team-wide usage    | No login required initially, localStorage for progress |

---

## 2. Core Entities

These are the building blocks of the app — every feature traces back to one of these.

```
Track      → TypeScript, React, Node.js, SQL etc.
Module     → group of related lessons (e.g. "Generics", "Utility Types")
Lesson     → single concept with explanation + code editor + quiz
Exercise   → practice challenge inside a lesson
Progress   → which lessons a user has completed
User       → (Phase 2) team member with login
```

---

## 3. Key User Flows

```
1. Home → pick a track
2. Track page → see modules + personal progress
3. Lesson page → read explanation → try code in editor → take quiz
4. Complete lesson → progress saved → move to next
```

---

## 4. Tech Stack Decisions

### Framework — Next.js 15 (App Router)

**Considered:** Next.js, Vite + React, Remix

**Chose Next.js because:**

- File-based routing is free — no React Router setup
- Excellent markdown/static file support at build time
- API routes built in — no separate Express server needed
- Team is learning it — real project is better than a tutorial
- Vercel (made by the Next.js team) deploys it in one click

**App Router vs Pages Router:**
App Router is the modern approach (Next.js 13+). Uses React Server Components by default — components run on the server and send HTML, reducing JavaScript sent to the browser. Only add `"use client"` when the component needs interactivity.

---

### Styling — Tailwind CSS

**Considered:** Tailwind, CSS Modules, Styled Components

**Chose Tailwind because:**

- Fastest development speed — no context switching between files
- Built-in consistent design system (spacing, colors, typography)
- Purges unused CSS automatically — small production bundle
- Used in most modern React codebases the team will encounter

---

### Content — Markdown + JSON Files

**Considered:** MDX, Markdown + JSON, CMS (Contentful/Sanity), Database

**Chose Markdown + JSON because:**

- Non-developers on the team can write and edit lessons
- No React knowledge required to add content
- Version controlled in git — lesson changes are tracked like code
- Simple to parse and render

**Known tradeoff — content goes stale:**

File-based content has no automatic update mechanism. When TypeScript 6.0 ships, nobody updates the lessons unless someone does it manually.

**Mitigation built in from day one:** Every `lesson.md` has version frontmatter:

```md
---
version: "TypeScript 5.x"
since: 2012
stable: true
---
```

**Phase 2 plan — MCP-assisted content maintenance:**

```
MCP server reads official changelogs (TypeScript, React, Next.js etc.)
       ↓
Compares each lesson's "version" field against the latest official release
       ↓
New major version detected → flags affected lessons as potentially outdated
       ↓
Claude reviews the changelog diff and updates the lesson automatically
```

This is also a learning exercise — building an MCP server that connects
AI to live documentation is a real production use case for the team to learn.

**Structure per lesson:**

```
/content/typescript/01-basic-types/
  lesson.md       explanation and examples
  starter.ts      code editor starting point
  solution.ts     reference answer
  quiz.json       array of questions
```

---

### Code Editor — Monaco

**Considered:** Monaco Editor, CodeMirror

**Chose Monaco because:**

- Same engine as VS Code
- Full TypeScript IntelliSense in the browser
- Errors, autocomplete, hover types — identical to real development
- This is a core feature, worth the ~2MB bundle size

---

### Progress Storage — localStorage (now) → PostgreSQL (later)

**Considered:** localStorage, IndexedDB, PostgreSQL

**Chose localStorage now because:**

- No login required — works immediately for the whole team
- Data is small (just lesson completion flags)
- Simple API

**Critical design decision — abstraction layer:**

We never call localStorage directly from components:

```ts
// ❌ Wrong — localStorage scattered everywhere
// Hard to find, hard to change, breaks when you add a DB
localStorage.setItem(`lesson-${id}`, "complete");

// ✅ Right — one module owns all progress logic
import { progress } from "@/lib/progress";
progress.complete(lessonId);
```

When PostgreSQL is added in Phase 2, only `lib/progress.ts` changes.
Every component stays exactly the same. This is **Dependency Inversion**.

---

### API Design — Single Client with Environment Variable

```ts
// lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";
```

Today this calls Next.js API routes (`/api`).
In Phase 3 when the Spring Boot backend is ready:

```
NEXT_PUBLIC_API_URL=https://api.pvgacademy.com
```

Frontend never changes. One environment variable swap.

---

### Authentication — None now → NextAuth.js (Phase 2)

**Considered:** NextAuth.js, Clerk, Auth0

**Will choose NextAuth.js because:**

- Open source, no vendor lock-in
- Built specifically for Next.js
- Teaches how auth actually works (JWT, sessions, OAuth providers)
- Clerk and Auth0 abstract it away — less learning value

---

### Database — None now → PostgreSQL on Neon (Phase 2)

**Considered:** PostgreSQL, MongoDB, SQLite

**Will choose PostgreSQL because:**

- SQL is a skill the team needs anyway (it's a learning track)
- Neon provides free hosted PostgreSQL
- Structured data fits perfectly in relational tables
- Industry standard in most companies

---

### ORM — None now → Prisma (Phase 2)

**Considered:** Prisma, Drizzle, Raw SQL

**Will choose Prisma because:**

- Auto-generates TypeScript types from database schema
- Most beginner-friendly ORM
- Very common in Next.js projects — team will see it everywhere

---

### Testing — Vitest + Playwright

**Considered:** Jest vs Vitest (unit), Playwright vs Cypress (E2E)

**Chose Vitest because:**

- Built for modern Next.js/Vite projects
- Significantly faster than Jest
- Same API as Jest — easy to learn

**Chose Playwright because:**

- Faster than Cypress
- Supports Chrome, Firefox, Safari in one run
- Backed by Microsoft, excellent TypeScript support

---

### Code Quality — ESLint + Prettier + Husky

```
ESLint        catches code problems (unused variables, bad patterns)
Prettier      enforces consistent formatting across the whole team
Husky         runs ESLint + Prettier automatically before every git commit
lint-staged   only checks files you changed (not the whole codebase)
```

Nobody can push badly formatted or broken code accidentally.

---

### CI/CD — GitHub Actions → Vercel

```
Push to GitHub
      ↓
GitHub Actions runs:
  - TypeScript typecheck
  - ESLint
  - Vitest unit tests
  - Playwright E2E tests
      ↓
All pass? → Vercel deploys automatically
Any fail? → Deploy blocked, email sent
```

Every pull request gets a unique preview URL.
Team can review and test before merging.

---

### Monitoring — Sentry + Vercel Analytics

```
Sentry              → captures runtime errors with stack traces
                    → tells you exactly what broke and where
Vercel Analytics    → page views, performance scores, Core Web Vitals
                    → one line to add, no cookies, privacy friendly
Lighthouse CI       → runs performance audit on every PR
                    → blocks deploy if score drops below threshold
```

---

## 5. Folder Structure

**Principle: group by feature, not by file type.**

```
/app                               Next.js routes (App Router)
  /page.tsx                        home — track picker
  /tracks/[track]/page.tsx         track overview + module list
  /tracks/[track]/[lesson]/        lesson page
    page.tsx
  /api/                            API routes (thin — call services)

/content                           learning content (non-developers edit here)
  /typescript/
    /01-basic-types/
      lesson.md
      starter.ts
      solution.ts
      quiz.json
  /react/
  /nodejs/

/components                        shared UI components
  /editor/                         Monaco editor wrapper
  /quiz/                           quiz engine (MCQ, fix-the-bug, write-the-type)
  /layout/                         nav, sidebar, progress bar

/lib                               pure logic — no UI, no components
  /services/                       business logic
    progress.service.ts
    content.service.ts
  progress.ts                      localStorage abstraction (swap to DB later)
  content.ts                       markdown file reader + parser
  api.ts                           single fetch client
  tracks.ts                        track metadata registry
  types.ts                         all shared TypeScript interfaces

/public                            static assets

/__tests__                         Vitest unit tests
/e2e                               Playwright E2E tests
```

---

## 6. Design Patterns Used

| Pattern                  | Where                                             | Why                                                             |
| ------------------------ | ------------------------------------------------- | --------------------------------------------------------------- |
| **Module pattern**       | `lib/progress.ts`, `lib/content.ts`, `lib/api.ts` | Group related logic, single export, easy to swap implementation |
| **Service layer**        | `lib/services/`                                   | Business logic separated from HTTP layer                        |
| **Provider pattern**     | Progress context                                  | Share state across pages without prop drilling                  |
| **Strategy pattern**     | Quiz engine                                       | MCQ, fix-the-bug, write-the-type share same interface           |
| **Factory pattern**      | Content loader                                    | Returns correct shape regardless of track                       |
| **Dependency Inversion** | `lib/progress.ts`                                 | Components depend on interface, not localStorage directly       |

---

## 7. Production Readiness Checklist

```
✅ Hosting          Vercel (free tier, Next.js native)
✅ CI/CD            GitHub Actions → Vercel auto-deploy
✅ Code quality     ESLint + Prettier + Husky
⬜ Testing          Vitest + Playwright (Phase 1)
⬜ Error monitoring Sentry (Phase 1)
⬜ Analytics        Vercel Analytics (Phase 1)
⬜ Auth             NextAuth.js (Phase 2)
⬜ Database         PostgreSQL on Neon (Phase 2)
⬜ Performance      Lighthouse CI (Phase 1)
⬜ SEO              next/metadata (Phase 1)
⬜ Security         env vars, input validation with Zod (Phase 2)
```

---

## 8. Three-Project Roadmap

```
Project 1 — pvg-academy (this repo)
            Next.js + TypeScript + Tailwind + PostgreSQL
            You learn: Next.js, TypeScript, CI/CD, Vercel, architecture

Project 2 — pvg-academy-backend (3–6 months)
            Java + Spring Boot + Kafka + Docker
            Replaces Next.js API routes with real microservices
            pvg-academy frontend calls this via NEXT_PUBLIC_API_URL
            You learn: Spring Boot, REST APIs, Kafka, Docker

Project 3 — pvg-academy-infra (6–12 months)
            Kubernetes + AWS ECS/EKS + Terraform
            Deploys both apps to production cloud infrastructure
            You learn: DevOps, cloud, infrastructure as code
```

---

## 9. Architectural Principles

**Separation of concerns**
Components only know the interface. `lib/` owns the implementation.
A component never knows if data comes from localStorage or a database.

**Code to an interface, not an implementation**
Design the abstraction today. Swap the implementation when needed.
Zero component changes when localStorage becomes PostgreSQL.

**Future-proof without over-engineering**
Design for auth and database now (correct data shapes, correct abstractions).
Do not implement what you do not need today.

**Thin API layer, thick service layer**
API routes receive a request, call a service, return a response. Nothing else.
All logic — validation, business rules, error handling — lives in `lib/services/`.

**Content is data, not code**
Lessons live in markdown files anyone can edit.
The app reads and renders them. Decoupled by design.

---

_Created: April 2026_
_Stack decisions made before writing a single line of application code._
