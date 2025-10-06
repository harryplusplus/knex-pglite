import { PGlite } from "@electric-sql/pglite";
import { expect, test } from "vitest";

test("clone not supported", async () => {
  const pglite = new PGlite();

  await expect(pglite.clone()).rejects.toThrow(TypeError);
});
