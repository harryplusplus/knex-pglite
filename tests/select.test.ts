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

test("select empty", async () => {
  expect(await knex("users").select()).toEqual([]);
});

test("select all 1 matched", async () => {
  await knex("users").insert({ name: "a" });
  expect(await knex("users").select()).toEqual([{ id: 1, name: "a" }]);
});

test("select all 2 matched", async () => {
  await knex("users").insert({ name: "a" });
  await knex("users").insert({ name: "b" });
  expect(await knex("users").select()).toEqual([
    { id: 1, name: "a" },
    { id: 2, name: "b" },
  ]);
});

test("select id", async () => {
  await knex("users").insert({ name: "a" });
  expect(await knex("users").select("id")).toEqual([{ id: 1 }]);
  expect(await knex("users as u").select("u.id")).toEqual([{ id: 1 }]);
});

test("select id, name", async () => {
  await knex("users").insert({ name: "a" });
  expect(await knex("users").select("id", "name")).toEqual([
    { id: 1, name: "a" },
  ]);
  expect(await knex("users as u").select("u.id", "u.name")).toEqual([
    { id: 1, name: "a" },
  ]);
});
