const PREFIX = "pvga";

function key(trackId: string, lessonId: string): string {
  return `${PREFIX}:${trackId}:${lessonId}`;
}

export const progress = {
  complete(lessonId: string, trackId: string): void {
    localStorage.setItem(key(trackId, lessonId), "complete");
  },

  isComplete(lessonId: string, trackId: string): boolean {
    return localStorage.getItem(key(trackId, lessonId)) === "complete";
  },

  getCompleted(trackId: string): Set<string> {
    const completed = new Set<string>();
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(`${PREFIX}:${trackId}:`)) {
        const lessonId = k.split(":")[2];
        completed.add(lessonId);
      }
    }
    return completed;
  },

  reset(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(`${PREFIX}:`)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  },
};
