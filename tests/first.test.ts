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

test("first empty", async () => {
  expect(await knex("users").first()).toEqual(undefined);
});

test("first matched", async () => {
  await knex("users").insert({ name: "a" });
  expect(await knex("users").first()).toEqual({ id: 1, name: "a" });
});

test("first id", async () => {
  await knex("users").insert({ name: "a" });
  expect(await knex("users").first("id")).toEqual({ id: 1 });
  expect(await knex("users as u").first("u.id")).toEqual({ id: 1 });
});

test("first id, name", async () => {
  await knex("users").insert({ name: "a" });
  expect(await knex("users").first("id", "name")).toEqual({ id: 1, name: "a" });
  expect(await knex("users as u").first("u.id", "u.name")).toEqual({
    id: 1,
    name: "a",
  });
});
