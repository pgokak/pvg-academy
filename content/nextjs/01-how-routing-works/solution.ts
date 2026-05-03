// 1. Static page — empty object, no dynamic params
async function AboutPage({ params }: { params: Promise<{}> }) {
  return "About Page";
}

// 2. Dynamic blog post — single segment [slug]
async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return `Post: ${slug}`;
}

// 3. Nested dynamic route — two segments [track] and [lesson]
async function LessonPage({
  params,
}: {
  params: Promise<{ track: string; lesson: string }>;
}) {
  const { track, lesson } = await params;
  return `${track} / ${lesson}`;
}
