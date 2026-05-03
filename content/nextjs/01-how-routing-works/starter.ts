// Exercise: Replace each `unknown` with the correct params object type.
// In Next.js 15, params is a Promise — it must be awaited.

// 1. Static page — no dynamic segments
//    File: app/about/page.tsx
//    URL:  /about
//    Hint: No dynamic params — use an empty object type {}
type AboutParams = unknown;

// 2. Dynamic blog post page — one segment [slug]
//    File: app/blog/[slug]/page.tsx
//    URL:  /blog/hello-world  →  slug = "hello-world"
//    Hint: { slug: string }
type BlogParams = unknown;

// 3. Nested dynamic route — two segments [track] and [lesson]
//    File: app/tracks/[track]/[lesson]/page.tsx
//    URL:  /tracks/typescript/01-basic-types
//    Hint: { track: string; lesson: string }
type LessonParams = unknown;

// In a real Next.js page component the function signature looks like:
// async function LessonPage({ params }: { params: Promise<LessonParams> }) {
//   const { track, lesson } = await params;
// }

export type { AboutParams, BlogParams, LessonParams };
