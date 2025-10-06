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

test("insert", async () => {
  expect(await db("users").insert({ name: "a" })).toEqual({
    affectedRows: 1,
    fields: [],
    rows: [],
  });
});

test("insert multiple rows", async () => {
  expect(await db("users").insert([{ name: "a" }, { name: "b" }])).toEqual({
    affectedRows: 2,
    fields: [],
    rows: [],
  });
});

test("insert returning all", async () => {
  expect(await db("users").insert({ name: "a" }).returning("*")).toEqual([
    { id: 1, name: "a" },
  ]);
});

test("insert returning id", async () => {
  expect(await db("users").insert({ name: "a" }).returning("id")).toEqual([
    { id: 1 },
  ]);
});
