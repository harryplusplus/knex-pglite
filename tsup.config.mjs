import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  sourcemap: true,
  format: ["cjs", "esm"],
  outExtension: ({ format }) => (format === "esm" ? "js" : format),
});
