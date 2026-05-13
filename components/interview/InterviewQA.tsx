"use client";

import { useState } from "react";

export interface InterviewQuestion {
  question: string;
  answer: string;
  followUp?: string;
}

interface Props {
  questions: InterviewQuestion[];
}

export default function InterviewQA({ questions }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(i: number) {
    setOpenIndex(openIndex === i ? null : i);
  }

  return (
    <section className="mt-8 mb-16">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Interview Prep</h2>
        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 font-medium">
          Senior level · Top companies
        </span>
      </div>

      <div className="space-y-2">
        {questions.map((q, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Question row */}
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900 leading-snug">
                    {q.question}
                  </span>
                </div>
                <svg
                  className={`shrink-0 w-4 h-4 text-gray-400 mt-0.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Answer */}
              {isOpen && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed mt-4 whitespace-pre-wrap">
                    {q.answer}
                  </p>
                  {q.followUp && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">
                        Follow-up they might ask:
                      </p>
                      <p className="text-sm text-amber-800">{q.followUp}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
