# PVG Academy — Design Reference

> Wireframes and layout decisions for every page.
> Add each new page here before writing code.
>
> **Future:** Connect this to an MCP server so Claude can read design specs
> directly from Figma. Figma has an official MCP server — when we reach Phase 2,
> replace this file with live Figma → MCP → Claude code generation.

---

## Lesson File Format

Every `lesson.md` must start with this frontmatter block:

```md
---
title: "Lesson Title"
track: "typescript"           ← must match the track id in lib/tracks.ts
version: "TypeScript 5.x"    ← latest stable version this lesson targets
introduced: "TypeScript 1.0"  ← when this concept first appeared
since: 2012                   ← year the concept was introduced
stable: true                  ← false if the API is experimental or likely to change
---
```

**Why `since` year matters:** Learners can immediately see if a concept is battle-tested (2012) or brand new (2024) without cross-referencing changelogs.

**Future (MCP):** An MCP server will read these fields and flag lessons where `version` is behind the latest official release.

---

## Home Page — Track Picker (`/`)

### Wireframe

```
┌─────────────────────────────────────────────────────────┐
│  PVG Academy                                            │  ← top nav (logo only, Phase 1)
└─────────────────────────────────────────────────────────┘

  Choose your track                                         ← h1
  Learn by doing — pick a topic and start practicing.       ← subheading

  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │  🟦           │  │  ⚛️           │  │  🟢           │
  │  TypeScript  │  │  React       │  │  Node.js     │
  │              │  │              │  │              │
  │  12 lessons  │  │  Coming soon │  │  Coming soon │
  └──────────────┘  └──────────────┘  └──────────────┘

  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │  🐘           │  │  ☕           │  │  🟠           │
  │  SQL         │  │  Spring Boot │  │  Kafka       │
  │              │  │              │  │              │
  │  Coming soon │  │  Coming soon │  │  Coming soon │
  └──────────────┘  └──────────────┘  └──────────────┘
```

### Layout Decisions

| Decision                               | Reason                                                            |
| -------------------------------------- | ----------------------------------------------------------------- |
| Grid of cards                          | Lets user scan all tracks at a glance — no scrolling needed       |
| "Coming soon" cards visible            | Shows the full roadmap, not a blank grid. Builds anticipation.    |
| Available tracks: fully clickable      | Clear call to action                                              |
| Coming-soon tracks: dimmed, not hidden | Visible but clearly unavailable — no confusion                    |
| No sidebar on home                     | Sidebar is for lesson navigation. Home only needs the track grid. |
| Server Component (no "use client")     | No interactivity needed — just links. Server renders faster.      |

### Data needed on this page

```ts
Track {
  id: string          // "typescript" — used in href="/tracks/typescript"
  title: string       // "TypeScript"
  description: string // shown under the title
  icon: string        // emoji
  lessonCount: number // "12 lessons"
  status: "available" | "coming-soon"
}
```

---

## Track Page — Lesson List (`/tracks/[track]`)

> To be designed when we build this page.

---

## Lesson Page — Learn + Practice (`/tracks/[track]/[lesson]`)

> To be designed when we build this page.

---

_Last updated: April 2026_
