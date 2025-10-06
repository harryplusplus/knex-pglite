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

test("select empty", async () => {
  expect(await db("users").select()).toEqual([]);
});

test("select all 1 matched", async () => {
  await db("users").insert({ name: "a" });
  expect(await db("users").select()).toEqual([{ id: 1, name: "a" }]);
});

test("select all 2 matched", async () => {
  await db("users").insert({ name: "a" });
  await db("users").insert({ name: "b" });
  expect(await db("users").select()).toEqual([
    { id: 1, name: "a" },
    { id: 2, name: "b" },
  ]);
});

test("select id", async () => {
  await db("users").insert({ name: "a" });
  expect(await db("users").select("id")).toEqual([{ id: 1 }]);
  expect(await db("users as u").select("u.id")).toEqual([{ id: 1 }]);
});

test("select id, name", async () => {
  await db("users").insert({ name: "a" });
  expect(await db("users").select("id", "name")).toEqual([
    { id: 1, name: "a" },
  ]);
  expect(await db("users as u").select("u.id", "u.name")).toEqual([
    { id: 1, name: "a" },
  ]);
});
