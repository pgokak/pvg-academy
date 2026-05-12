"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { notes, type NoteImage } from "@/lib/notes";

interface Props {
  trackId: string;
  lessonId: string;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function LessonNotes({ trackId, lessonId }: Props) {
  const [text, setText] = useState(() => notes.get(trackId, lessonId).text);
  const [images, setImages] = useState<NoteImage[]>(
    () => notes.get(trackId, lessonId).images,
  );
  const [saved, setSaved] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const persist = useCallback(
    (nextText: string, nextImages: NoteImage[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        notes.save(trackId, lessonId, { text: nextText, images: nextImages });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }, 600);
    },
    [trackId, lessonId],
  );

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    persist(e.target.value, images);
  }

  async function addImageFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const dataUrl = await fileToDataUrl(file);
    const image: NoteImage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      dataUrl,
      name: file.name,
    };
    const next = [...images, image];
    setImages(next);
    persist(text, next);
  }

  async function handlePaste(e: React.ClipboardEvent) {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((i) => i.type.startsWith("image/"));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (file) await addImageFile(file);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await addImageFile(file);
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await addImageFile(file);
    e.target.value = "";
  }

  function removeImage(id: string) {
    const next = images.filter((img) => img.id !== id);
    setImages(next);
    persist(text, next);
  }

  const isEmpty = text.trim() === "" && images.length === 0;

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">My Notes</h2>

      <div
        className={`bg-white rounded-xl border-2 transition-colors ${
          dragging ? "border-blue-400 bg-blue-50" : "border-gray-200"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {/* Textarea */}
        <textarea
          className="w-full px-5 pt-5 pb-3 text-sm text-gray-800 placeholder-gray-400 bg-transparent resize-none focus:outline-none min-h-35"
          placeholder="Write your notes here… paste a screenshot anywhere to attach it."
          value={text}
          onChange={handleTextChange}
          onPaste={handlePaste}
        />

        {/* Image thumbnails */}
        {images.length > 0 && (
          <div className="px-5 pb-3 flex flex-wrap gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="h-24 w-auto rounded-lg border border-gray-200 object-cover cursor-pointer"
                  onClick={() => window.open(img.dataUrl, "_blank")}
                />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute -top-2 -right-2 hidden group-hover:flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full text-xs leading-none"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer bar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              Attach image
            </button>
            <span className="text-xs text-gray-400">
              or paste / drag & drop
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isEmpty && (
              <button
                onClick={() => {
                  if (confirm("Clear all notes for this lesson?")) {
                    setText("");
                    setImages([]);
                    notes.clear(trackId, lessonId);
                  }
                }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            )}
            <span
              className={`text-xs transition-opacity duration-300 ${saved ? "opacity-100 text-green-600" : "opacity-0"}`}
            >
              Saved ✓
            </span>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />
    </section>
  );
}
