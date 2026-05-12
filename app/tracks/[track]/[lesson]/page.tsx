import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getLesson } from "@/lib/content";
import CodeEditor from "@/components/editor/CodeEditor";
import Quiz from "@/components/quiz/Quiz";
import LessonNotes from "@/components/notes/LessonNotes";

// Next.js 15: params is a Promise — must be awaited
export default async function LessonPage({
  params,
}: {
  params: Promise<{ track: string; lesson: string }>;
}) {
  const { track: trackId, lesson: lessonId } = await params;

  const lesson = getLesson(trackId, lessonId);
  if (!lesson) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <span className="text-xl font-bold text-gray-900">PVG Academy</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <Link
          href={`/tracks/${trackId}`}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← Back to {trackId}
        </Link>

        <div className="mt-6 flex gap-8 items-start">
          {/* Left column — lesson content */}
          <div className="flex-1 min-w-0">
            {/* Lesson header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <span>Lesson {String(lesson.order).padStart(2, "0")}</span>
                <span>·</span>
                <span>{lesson.version}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {lesson.title}
              </h1>
            </div>

            {/* Lesson body — rendered markdown */}
            <section className="prose prose-gray max-w-none bg-white rounded-xl border border-gray-200 px-8 py-6">
              <ReactMarkdown>{lesson.body}</ReactMarkdown>
            </section>

            {/* Code editor */}
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Exercise
              </h2>
              <CodeEditor starter={lesson.starter} language={lesson.language} />
            </section>

            {/* Quiz */}
            <section className="mt-8 mb-16">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Quiz</h2>
              <Quiz
                questions={lesson.quiz}
                lessonId={lessonId}
                trackId={trackId}
              />
            </section>
          </div>

          {/* Right column — sticky notes */}
          <div className="w-80 shrink-0 sticky top-6 self-start">
            <LessonNotes trackId={trackId} lessonId={lessonId} />
          </div>
        </div>
      </main>
    </div>
  );
}
