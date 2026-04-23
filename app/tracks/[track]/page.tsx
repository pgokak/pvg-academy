import Link from "next/link";
import { notFound } from "next/navigation";
import { TRACKS } from "@/lib/tracks";
import { getLessons } from "@/lib/content";
import { LessonMeta } from "@/lib/types";

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

        {/* Lesson list */}
        <div className="mt-8 flex flex-col gap-2">
          {lessons.length === 0 ? (
            <p className="text-gray-400">No lessons yet.</p>
          ) : (
            lessons.map((lesson) => (
              <LessonRow key={lesson.id} lesson={lesson} trackId={trackId} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function LessonRow({
  lesson,
  trackId,
}: {
  lesson: LessonMeta;
  trackId: string;
}) {
  return (
    <Link
      href={`/tracks/${trackId}/${lesson.id}`}
      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-4 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center gap-4">
        <span className="text-sm font-mono text-gray-400">
          {String(lesson.order).padStart(2, "0")}
        </span>
        <span className="font-medium text-gray-900">{lesson.title}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">{lesson.version}</span>
        <span className="text-gray-400">→</span>
      </div>
    </Link>
  );
}
