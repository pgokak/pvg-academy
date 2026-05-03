"use client";

import { useState } from "react";
import { QuizQuestion } from "@/lib/types";
import { progress } from "@/lib/progress";

interface Props {
  questions: QuizQuestion[];
  lessonId: string;
  trackId: string;
}

export default function Quiz({ questions, lessonId, trackId }: Props) {
  // Maps questionIndex → chosen optionIndex
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = questions.filter((q, i) => selected[i] === q.answer).length;
  const allAnswered = questions.every((_, i) => selected[i] !== undefined);

  function handleSelect(questionIndex: number, optionIndex: number) {
    if (submitted) return; // lock answers after submission
    setSelected((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }

  function handleSubmit() {
    if (!allAnswered) return;
    setSubmitted(true);
    if (score === questions.length) {
      progress.complete(lessonId, trackId);
    }
  }

  function handleReset() {
    setSelected({});
    setSubmitted(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Score banner — only shown after submission */}
      {submitted && (
        <div
          className={`rounded-lg px-5 py-3 text-sm font-medium ${
            score === questions.length
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-yellow-50 text-yellow-800 border border-yellow-200"
          }`}
        >
          {score === questions.length
            ? `Perfect — ${score} / ${questions.length} correct!`
            : `${score} / ${questions.length} correct — review the highlighted questions below`}
        </div>
      )}

      {/* Questions */}
      {questions.map((q, qi) => {
        const chosen = selected[qi];
        const isCorrect = submitted && chosen === q.answer;
        const isWrong =
          submitted && chosen !== undefined && chosen !== q.answer;

        return (
          <div
            key={qi}
            className={`rounded-xl border bg-white px-6 py-5 ${
              isCorrect
                ? "border-green-300"
                : isWrong
                  ? "border-red-300"
                  : "border-gray-200"
            }`}
          >
            <p className="font-medium text-gray-900 mb-4">
              <span className="text-gray-400 font-mono text-sm mr-2">
                Q{qi + 1}.
              </span>
              {q.question}
            </p>

            <div className="flex flex-col gap-2">
              {q.options.map((option, oi) => {
                const isChosen = chosen === oi;
                const isAnswer = q.answer === oi;

                let style =
                  "rounded-lg border px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ";

                if (!submitted) {
                  style += isChosen
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-200 hover:border-gray-400 text-gray-700";
                } else {
                  if (isAnswer) {
                    style +=
                      "border-green-500 bg-green-50 text-green-900 font-medium";
                  } else if (isChosen && !isAnswer) {
                    style += "border-red-400 bg-red-50 text-red-800";
                  } else {
                    style += "border-gray-200 text-gray-400 cursor-default";
                  }
                }

                return (
                  <button
                    key={oi}
                    className={style}
                    onClick={() => handleSelect(qi, oi)}
                    disabled={submitted}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Actions */}
      <div className="flex items-center gap-3">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Check Answers
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:border-gray-500 transition-colors"
          >
            Try Again
          </button>
        )}
        {!submitted && !allAnswered && (
          <span className="text-xs text-gray-400">
            Answer all {questions.length} questions to continue
          </span>
        )}
      </div>
    </div>
  );
}
