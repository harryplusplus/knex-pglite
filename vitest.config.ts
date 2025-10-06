import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node",
          include: ["**/*.test.ts"],
          exclude: ["**/*.browser.test.ts"],
          testTimeout: 10 * 1000,
          environment: "node",
        },
      },
      {
        test: {
          name: "browser",
          include: ["**/*.test.ts"],
          exclude: ["**/*.node.test.ts"],
          testTimeout: 10 * 1000,
          environment: "jsdom",
        },
      },
    ],
  },
});
