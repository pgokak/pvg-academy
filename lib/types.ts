export interface LessonMeta {
  id: string; // "01-basic-types" — folder name, used in URL
  title: string; // from frontmatter
  order: number; // 1, 2, 3 — parsed from the "01" prefix in folder name
  track: string; // "typescript"
  version: string; // "TypeScript 5.x" — from frontmatter
  since: number; // 2012 — year concept was introduced, from frontmatter
  stable: boolean; // from frontmatter
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number; // index into options — 0 = first option, 1 = second, etc.
}

export interface LessonContent extends LessonMeta {
  body: string; // markdown text without frontmatter
  starter: string; // contents of starter.ts shown in the editor
  quiz: QuizQuestion[]; // parsed quiz.json
}

export interface Track {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessonCount: number;
  status: "available" | "coming-soon";
}
