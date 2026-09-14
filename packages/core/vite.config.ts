import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        presets: "src/presets.ts",
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      external: [/^mirage-engine/, /^three/, /^@a2kama\/presets/],
      output: {
        exports: "named",
      },
    },
  },
  plugins: [dts({ include: ["src"] })],
});
