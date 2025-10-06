import { afterEach, beforeEach, expect, test } from "@jest/globals";
import knex, { Knex } from "knex";
import { defineConfig } from "../src";

let db: Knex;

beforeEach(async () => {
  db = knex(defineConfig());
  await db.schema.createTable("users", function (table) {
    table.increments("id");
    table.text("name");
  });
});

afterEach(async () => {
  await db?.destroy();
});

test("empty stream", async () => {
  const stream = db("users").select().stream();
  const rows = await stream.toArray();
  expect(rows).toEqual([]);
});

test("stream multiple rows", async () => {
  expect(await db("users").insert([{ name: "a" }, { name: "b" }])).toEqual({
    affectedRows: 2,
    fields: [],
    rows: [],
  });
  const stream = db("users").select().stream();
  const rows = await stream.toArray();
  expect(rows).toEqual([
    { id: 1, name: "a" },
    { id: 2, name: "b" },
  ]);
});
