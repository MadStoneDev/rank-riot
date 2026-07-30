import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      // Mirror the tsconfig "@/*" -> "./src/*" path alias.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // Provide an inline (empty) PostCSS config so vitest doesn't try to load the
  // app's Tailwind v4 postcss.config.mjs, which its pipeline can't process.
  css: { postcss: {} },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "node",
  },
});
