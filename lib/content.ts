import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { LessonMeta } from "@/lib/types";

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
