import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()], // Enables React Fast Refresh for instant feedback on edits. tells Vitest how to handle JSX/TSX files

  test: {
    environment: "jsdom", // Simulates a browser environment for testing React components.
    globals: true, // Allows using global test functions like `describe`, `it`, and `expect` without importing them.
    setupFiles: "./__tests__/setup.ts", // Specifies a setup file that runs before the tests, useful for configuring testing libraries or global mocks.
  },
});
