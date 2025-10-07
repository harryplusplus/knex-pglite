import Knex from "knex";
import { afterEach, beforeEach, expect, test } from "vitest";
import { PGliteDialect } from "../src/index.js";

let knex: Knex.Knex;

beforeEach(() => {
  knex = Knex({
    client: PGliteDialect,
    connection: {},
  });
});

afterEach(async () => {
  await knex?.destroy();
});

test("transaction", async () => {
  expect(
    await knex.transaction(async (tx) => {
      expect(await tx.raw("select 1")).toEqual({
        affectedRows: 0,
        fields: [
          {
            dataTypeID: 23,
            name: "?column?",
          },
        ],
        rows: [
          {
            "?column?": 1,
          },
        ],
      });
    })
  ).toBe(undefined);
});
