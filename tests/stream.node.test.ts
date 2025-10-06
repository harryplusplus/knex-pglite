import Knex from "knex";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { Client_PGlite } from "../src/index.js";

describe("success", () => {
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

  test("empty stream", async () => {
    const stream = knex("users").select().stream();
    const rows = await stream.toArray();
    expect(rows).toEqual([]);
  });

  test("stream multiple rows", async () => {
    expect(await knex("users").insert([{ name: "a" }, { name: "b" }])).toEqual({
      affectedRows: 2,
      fields: [],
      rows: [],
    });
    const stream = knex("users").select().stream();
    const rows = await stream.toArray();
    expect(rows).toEqual([
      { id: 1, name: "a" },
      { id: 2, name: "b" },
    ]);
  });
});

describe("failure", () => {
  let knex: Knex.Knex;

  beforeEach(() => {
    knex = Knex({
      client: Client_PGlite,
      connection: {},
    });
  });

  afterEach(async () => {
    await knex?.destroy();
  });

  test("no table", async () => {
    const stream = knex("users").select().stream();
    await expect(stream.toArray()).rejects.toThrow();
    await new Promise((resolve) => stream.on("close", resolve));
  });
});
