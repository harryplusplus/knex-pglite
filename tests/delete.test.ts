import Knex from "knex";
import { afterEach, beforeEach, expect, test } from "vitest";
import { PGliteDialect } from "../src/index.js";

let knex: Knex.Knex;

beforeEach(async () => {
  knex = Knex({
    client: PGliteDialect,
    connection: {},
  });
  await knex.schema.createTable("users", function (table) {
    table.increments("id");
    table.text("name");
  });
});

afterEach(async () => {
  await knex?.destroy();
});

test("delete", async () => {
  await knex("users").insert({ name: "a" });
  expect(await knex("users").delete().where({ id: 1 })).toEqual(1);
});

test("delete returning all", async () => {
  await knex("users").insert({ name: "a" });
  expect(await knex("users").delete().where({ id: 1 }).returning("*")).toEqual([
    { id: 1, name: "a" },
  ]);
});
