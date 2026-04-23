export interface LessonMeta {
  id: string; // "01-basic-types" — folder name, used in URL
  title: string; // from frontmatter
  order: number; // 1, 2, 3 — parsed from the "01" prefix in folder name
  track: string; // "typescript"
  version: string; // "TypeScript 5.x" — from frontmatter
  since: number; // 2012 — year concept was introduced, from frontmatter
  stable: boolean; // from frontmatter
}

export interface Track {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessonCount: number;
  status: "available" | "coming-soon";
}
