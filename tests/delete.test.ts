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

test("delete", async () => {
  await db("users").insert({ name: "a" });
  expect(await db("users").delete().where({ id: 1 })).toEqual(1);
});

test("delete returning all", async () => {
  await db("users").insert({ name: "a" });
  expect(await db("users").delete().where({ id: 1 }).returning("*")).toEqual([
    { id: 1, name: "a" },
  ]);
});
