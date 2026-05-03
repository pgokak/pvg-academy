"use client";

import { useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { LessonMeta } from "@/lib/types";
import { progress } from "@/lib/progress";

interface Props {
  lessons: LessonMeta[];
  trackId: string;
}

const emptySet = new Set<string>();

export default function LessonList({ lessons, trackId }: Props) {
  // Cache the snapshot so useSyncExternalStore gets the same reference on every call.
  // The ref resets to null when the component unmounts (navigating away and back),
  // which causes a fresh localStorage read on the next mount.
  const cacheRef = useRef<Set<string> | null>(null);

  const completed = useSyncExternalStore(
    () => () => {}, // no subscription — localStorage has no change events
    () => {
      if (cacheRef.current === null) {
        cacheRef.current = progress.getCompleted(trackId);
      }
      return cacheRef.current;
    },
    () => emptySet, // server: safe empty set
  );

  if (lessons.length === 0) {
    return <p className="text-gray-400">No lessons yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {lessons.map((lesson) => {
        const done = completed.has(lesson.id);
        return (
          <Link
            key={lesson.id}
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
              <span
                className="text-lg"
                title={done ? "Completed" : "Not started"}
              >
                {done ? "✅" : "○"}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
