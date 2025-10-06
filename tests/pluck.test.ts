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

test("pluck empty", async () => {
  expect(await knex("users").pluck("id")).toEqual([]);
});

test("pluck id 1 matched", async () => {
  await knex("users").insert({ name: "a" });
  expect(await knex("users").pluck("id")).toEqual([1]);
  expect(await knex("users as u").pluck("u.id")).toEqual([1]);
});

test("pluck id 2 matched", async () => {
  await knex("users").insert({ name: "a" });
  await knex("users").insert({ name: "b" });
  expect(await knex("users").pluck("id")).toEqual([1, 2]);
});

test("pluck name", async () => {
  await knex("users").insert({ name: "a" });
  expect(await knex("users").pluck("name")).toEqual(["a"]);
  expect(await knex("users as u").pluck("u.name")).toEqual(["a"]);
});
