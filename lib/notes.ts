const PREFIX = "pvga:notes";

export interface NoteImage {
  id: string;
  dataUrl: string; // base64 encoded image
  name: string;
}

export interface Note {
  text: string;
  images: NoteImage[];
  updatedAt: number; // timestamp
}

function key(trackId: string, lessonId: string): string {
  return `${PREFIX}:${trackId}:${lessonId}`;
}

export const notes = {
  get(trackId: string, lessonId: string): Note {
    const raw = localStorage.getItem(key(trackId, lessonId));
    if (!raw) return { text: "", images: [], updatedAt: 0 };
    try {
      return JSON.parse(raw) as Note;
    } catch {
      return { text: "", images: [], updatedAt: 0 };
    }
  },

  save(trackId: string, lessonId: string, note: Omit<Note, "updatedAt">): void {
    const data: Note = { ...note, updatedAt: Date.now() };
    localStorage.setItem(key(trackId, lessonId), JSON.stringify(data));
  },

  clear(trackId: string, lessonId: string): void {
    localStorage.removeItem(key(trackId, lessonId));
  },
};
