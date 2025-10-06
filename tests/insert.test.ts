import { afterEach, beforeEach, expect, test } from "@jest/globals";
import Knex from "knex";
import { Client_PGlite } from "../src";

let knex: Knex.Knex;

beforeEach(async () => {
  knex = Knex({
    client: Client_PGlite,
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

test("insert", async () => {
  expect(await knex("users").insert({ name: "a" })).toEqual({
    affectedRows: 1,
    fields: [],
    rows: [],
  });
});

test("insert multiple rows", async () => {
  expect(await knex("users").insert([{ name: "a" }, { name: "b" }])).toEqual({
    affectedRows: 2,
    fields: [],
    rows: [],
  });
});

test("insert returning all", async () => {
  expect(await knex("users").insert({ name: "a" }).returning("*")).toEqual([
    { id: 1, name: "a" },
  ]);
});

test("insert returning id", async () => {
  expect(await knex("users").insert({ name: "a" }).returning("id")).toEqual([
    { id: 1 },
  ]);
});
