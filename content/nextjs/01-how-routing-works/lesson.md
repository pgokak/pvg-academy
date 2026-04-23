---
title: "How Next.js Routing Works"
track: "nextjs"
version: "Next.js 15.x"
introduced: "Next.js 13.0 (App Router)"
since: 2023
stable: true
---

# How Next.js Routing Works

## The Core Idea

Next.js uses **file-based routing**. There is no router config file, no place where you register routes manually. The folder structure inside `app/` **is** the router.

If a folder has a `page.tsx` file, it becomes a URL. That's the entire rule.

---

## File Structure → URLs

```
app/
  page.tsx                      →  /
  layout.tsx                    →  wraps every page (not a URL itself)
  tracks/
    page.tsx                    →  /tracks
    [track]/
      page.tsx                  →  /tracks/typescript
                                   /tracks/react
                                   /tracks/nodejs
                                   (any value in the brackets works)
      [lesson]/
        page.tsx                →  /tracks/typescript/01-basic-types
```

The `[bracket]` syntax means "dynamic segment" — any value is accepted there. You access it in code as a parameter.

---

## The Two Special Files

### `page.tsx` — the page content

This is what the user sees at that URL. Replace it and the page changes.

```tsx
// app/page.tsx — this IS the home page at /
export default function HomePage() {
  return <h1>Welcome</h1>;
}
```

### `layout.tsx` — the frame around every page

Wraps every page in its folder and all subfolders. Used for nav bars, fonts, global styles — anything that appears on every page.

```tsx
// app/layout.tsx — wraps every page in the whole app
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <nav>PVG Academy</nav>
        {children} {/* ← current page.tsx renders here */}
      </body>
    </html>
  );
}
```

Layouts nest. A layout in `app/tracks/layout.tsx` wraps only track pages, and is itself wrapped by `app/layout.tsx`.

---

## The Request Flow

When a user visits `http://localhost:3000/tracks/typescript`:

```
1. Next.js reads the URL:   /tracks/typescript
2. Matches the file:        app/tracks/[track]/page.tsx
3. Extracts the param:      track = "typescript"
4. Runs layout.tsx          (builds the HTML shell)
5. Runs page.tsx            (inserts page content into {children})
6. Sends HTML to browser
```

No configuration. No router registration. Just files.

---

## Server Components vs Client Components

By default, every `page.tsx` and component is a **Server Component** — it runs on the server and sends HTML to the browser. No JavaScript is sent for it.

Add `"use client"` at the top of a file only when you need browser-only features:

```tsx
// Server Component (default) — runs on server
// ✅ Use for: fetching data, reading files, static content
export default async function TrackPage() {
  const lessons = await getLessons(); // this runs on the server
  return (
    <ul>
      {lessons.map((l) => (
        <li>{l.title}</li>
      ))}
    </ul>
  );
}
```

```tsx
// Client Component — runs in browser
// ✅ Use for: useState, onClick, localStorage, browser APIs
"use client";
export default function QuizComponent() {
  const [answer, setAnswer] = useState("");
  return <input onChange={(e) => setAnswer(e.target.value)} />;
}
```

**Rule of thumb:** Start with Server Component. Add `"use client"` only when TypeScript or React tells you something isn't available on the server.

---

## Link vs `<a>`

Always use Next.js `Link` for internal navigation. Never `<a>` for internal links.

```tsx
import Link from "next/link";

// ✅ Next.js Link — client-side navigation, no full page reload, faster
<Link href="/tracks/typescript">TypeScript Track</Link>

// ❌ Plain anchor — full page reload, loses client-side state
<a href="/tracks/typescript">TypeScript Track</a>
```

`Link` pre-fetches the next page in the background when it's visible on screen, making navigation feel instant.

---

## Key Takeaways

| Concept          | Rule                                                           |
| ---------------- | -------------------------------------------------------------- |
| `page.tsx`       | Creates a URL at that folder's path                            |
| `layout.tsx`     | Wraps all pages in its folder and subfolders                   |
| `[param]` folder | Dynamic segment — matches any value in the URL                 |
| Server Component | Default — runs on server, no JS sent to browser                |
| Client Component | Add `"use client"` — runs in browser, needed for interactivity |
| Internal links   | Always `Link`, never `<a>`                                     |
