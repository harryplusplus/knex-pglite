import { afterEach, beforeEach, expect, test } from "@jest/globals";
import { Knex } from "knex";
import { knexPGlite } from "../src";

let db: Knex;

beforeEach(() => {
  db = knexPGlite({
    searchPath: "private",
  });
});

afterEach(async () => {
  await db?.destroy();
});

test("search_path", async () => {
  expect(await db.raw("create schema private;")).toEqual({
    affectedRows: 0,
    fields: [],
    rows: [],
  });
  expect(
    await db.schema.createTable("users", function (table) {
      table.increments("id");
      table.text("name");
    })
  ).toEqual({
    affectedRows: 0,
    fields: [],
    rows: [],
  });
  expect(
    await db.raw(`
select table_schema, table_name 
from information_schema.tables 
where table_name = 'users';
`)
  ).toMatchObject({
    rows: [
      {
        table_name: "users",
        table_schema: "private",
      },
    ],
  });
});
