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

test("update", async () => {
  await knex("users").insert({ name: "a" });
  expect(await knex("users").update({ id: 1, name: "b" })).toEqual(1);
});

test("update returning all", async () => {
  await knex("users").insert({ name: "a" });
  expect(
    await knex("users").update({ id: 1, name: "b" }).returning("*")
  ).toEqual([{ id: 1, name: "b" }]);
});
