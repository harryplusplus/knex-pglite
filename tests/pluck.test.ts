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

test("pluck empty", async () => {
  expect(await db("users").pluck("id")).toEqual([]);
});

test("pluck id 1 matched", async () => {
  await db("users").insert({ name: "a" });
  expect(await db("users").pluck("id")).toEqual([1]);
  expect(await db("users as u").pluck("u.id")).toEqual([1]);
});

test("pluck id 2 matched", async () => {
  await db("users").insert({ name: "a" });
  await db("users").insert({ name: "b" });
  expect(await db("users").pluck("id")).toEqual([1, 2]);
});

test("pluck name", async () => {
  await db("users").insert({ name: "a" });
  expect(await db("users").pluck("name")).toEqual(["a"]);
  expect(await db("users as u").pluck("u.name")).toEqual(["a"]);
});
