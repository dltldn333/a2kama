import { defineConfig } from "vite";

// During local dev, resolve workspace packages to their TypeScript sources
// (the "a2kama-source" export condition) so dev/ demos don't need a dist build.
export default defineConfig({
  resolve: {
    conditions: ["a2kama-source"],
  },
});
