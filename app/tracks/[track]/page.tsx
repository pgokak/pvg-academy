import Link from "next/link";
import { notFound } from "next/navigation";
import { TRACKS } from "@/lib/tracks";
import { getLessons } from "@/lib/content";
import LessonList from "@/components/layout/LessonList";

// Next.js 15: params is a Promise — must be awaited
export default async function TrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track: trackId } = await params;

  const track = TRACKS.find((t) => t.id === trackId);
  if (!track) notFound(); // shows Next.js 404 page for unknown tracks

  const lessons = getLessons(trackId);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <span className="text-xl font-bold text-gray-900">PVG Academy</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← Back to tracks
        </Link>

        {/* Track header */}
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{track.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {track.title}
              </h1>
              <p className="text-gray-500">{track.description}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
          </p>
        </div>

        {/* Lesson list with progress indicators */}
        <div className="mt-8">
          <LessonList lessons={lessons} trackId={trackId} />
        </div>
      </main>
    </div>
  );
}
