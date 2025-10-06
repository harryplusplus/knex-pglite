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

test("first empty", async () => {
  expect(await db("users").first()).toEqual(undefined);
});

test("first matched", async () => {
  await db("users").insert({ name: "a" });
  expect(await db("users").first()).toEqual({ id: 1, name: "a" });
});

test("first id", async () => {
  await db("users").insert({ name: "a" });
  expect(await db("users").first("id")).toEqual({ id: 1 });
  expect(await db("users as u").first("u.id")).toEqual({ id: 1 });
});

test("first id, name", async () => {
  await db("users").insert({ name: "a" });
  expect(await db("users").first("id", "name")).toEqual({ id: 1, name: "a" });
  expect(await db("users as u").first("u.id", "u.name")).toEqual({
    id: 1,
    name: "a",
  });
});
