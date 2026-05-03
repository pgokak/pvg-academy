"use client";

import { useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface Props {
  starter: string;
}

export default function CodeEditor({ starter }: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [hasRun, setHasRun] = useState(false);
  const [running, setRunning] = useState(false);

  const handleMount: OnMount = (editorInstance) => {
    editorRef.current = editorInstance;
  };

  async function handleRun() {
    const tsCode = editorRef.current?.getValue() ?? "";
    setRunning(true);

    // Step 1: transpile TypeScript → JavaScript on the server
    let jsCode: string;
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: tsCode }),
      });
      const data = await res.json();
      if (data.error) {
        setOutput([`Compile error: ${data.error}`]);
        setHasRun(true);
        setRunning(false);
        return;
      }
      jsCode = data.js;
    } catch {
      setOutput(["Network error: could not reach /api/run"]);
      setHasRun(true);
      setRunning(false);
      return;
    }

    // Step 2: capture console.log output in the browser
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(" "));
    };

    // Step 3: execute the JavaScript
    try {
      new Function(jsCode)();
    } catch (err) {
      logs.push(
        `Runtime error: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      console.log = originalLog;
    }

    setOutput(
      logs.length > 0
        ? logs
        : ["(no output — add console.log() to see results)"],
    );
    setHasRun(true);
    setRunning(false);
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-700">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">exercise.ts</span>
        <button
          onClick={handleRun}
          disabled={running}
          className="flex items-center gap-1.5 rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {running ? "Running…" : "▶ Run"}
        </button>
      </div>

      {/* Editor */}
      <Editor
        height="400px"
        defaultLanguage="typescript"
        defaultValue={starter}
        theme="vs-dark"
        onMount={handleMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          tabSize: 2,
        }}
      />

      {/* Output panel — only shown after first run */}
      {hasRun && (
        <div className="border-t border-gray-700 bg-gray-950 px-4 py-3">
          <p className="text-xs text-gray-500 mb-2 font-mono">Output</p>
          {output.map((line, i) => (
            <p key={i} className="font-mono text-sm text-green-400">
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
