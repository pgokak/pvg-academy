import Link from "next/link";
import { TRACKS } from "@/lib/tracks";
import { Track } from "@/lib/types";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <span className="text-xl font-bold text-gray-900">PVG Academy</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Choose your track</h1>
        <p className="mt-2 text-gray-500">
          Learn by doing — pick a topic and start practicing.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
      </main>
    </div>
  );
}

function TrackCard({ track }: { track: Track }) {
  const isAvailable = track.status === "available";

  const cardContent = (
    <div
      className={`rounded-xl border bg-white p-6 transition-shadow ${
        isAvailable
          ? "border-gray-200 hover:shadow-md cursor-pointer"
          : "border-gray-100 opacity-50 cursor-not-allowed"
      }`}
    >
      <span className="text-3xl">{track.icon}</span>
      <h2 className="mt-3 text-lg font-semibold text-gray-900">
        {track.title}
      </h2>
      <p className="mt-1 text-sm text-gray-500">{track.description}</p>
      <p className="mt-4 text-xs font-medium text-gray-400">
        {isAvailable ? `${track.lessonCount} lessons` : "Coming soon"}
      </p>
    </div>
  );

  if (!isAvailable) return cardContent;

  return (
    <Link href={`/tracks/${track.id}`} className="block">
      {cardContent}
    </Link>
  );
}
