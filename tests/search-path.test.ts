import Knex from "knex";
import { afterEach, beforeEach, expect, test } from "vitest";
import { PGliteDialect } from "../src/index.js";

let knex: Knex.Knex;

beforeEach(() => {
  knex = Knex({
    client: PGliteDialect,
    connection: {},
    searchPath: "private",
  });
});

afterEach(async () => {
  await knex?.destroy();
});

test("search_path", async () => {
  expect(await knex.raw("create schema private;")).toEqual({
    affectedRows: 0,
    fields: [],
    rows: [],
  });
  expect(
    await knex.schema.createTable("users", function (table) {
      table.increments("id");
      table.text("name");
    })
  ).toEqual({
    affectedRows: 0,
    fields: [],
    rows: [],
  });
  expect(
    await knex.raw(`
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
