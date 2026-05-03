import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { LessonMeta, LessonContent } from "@/lib/types";

export function getLessons(trackId: string): LessonMeta[] {
  const contentDir = path.join(process.cwd(), "content", trackId);

  if (!fs.existsSync(contentDir)) return [];

  const folders = fs
    .readdirSync(contentDir)
    .filter((name) => fs.statSync(path.join(contentDir, name)).isDirectory())
    .sort(); // "01-..." always before "02-..." alphabetically

  return folders.map((folder) => {
    const order = parseInt(folder.split("-")[0], 10); // "01-basic-types" → 1
    const file = fs.readFileSync(
      path.join(contentDir, folder, "lesson.md"),
      "utf-8",
    );
    const { data } = matter(file); // splits frontmatter from content

    return {
      id: folder,
      title: data.title as string,
      order,
      track: trackId,
      version: data.version as string,
      since: data.since as number,
      stable: data.stable as boolean,
    };
  });
}

export function getLesson(
  trackId: string,
  lessonId: string,
): LessonContent | null {
  const lessonDir = path.join(process.cwd(), "content", trackId, lessonId);

  if (!fs.existsSync(lessonDir)) return null;

  // Read and parse lesson.md — split frontmatter from markdown body
  const lessonFile = fs.readFileSync(
    path.join(lessonDir, "lesson.md"),
    "utf-8",
  );
  const { data, content: body } = matter(lessonFile);

  // Read starter.ts — the code shown in the editor
  const starter = fs.readFileSync(path.join(lessonDir, "starter.ts"), "utf-8");

  // Read and parse quiz.json
  const quizFile = fs.readFileSync(path.join(lessonDir, "quiz.json"), "utf-8");
  const quiz = JSON.parse(quizFile);

  return {
    id: lessonId,
    title: data.title as string,
    order: parseInt(lessonId.split("-")[0], 10),
    track: trackId,
    version: data.version as string,
    since: data.since as number,
    stable: data.stable as boolean,
    body,
    starter,
    quiz,
  };
}
