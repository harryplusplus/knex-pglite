import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  keepNames: true,
  outExtension: ({ format }) => (format === "esm" ? "js" : format),
});
