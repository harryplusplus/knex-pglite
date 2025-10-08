import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  outExtension: ({ format }) => (format === "esm" ? "js" : format),
});
