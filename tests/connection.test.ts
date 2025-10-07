import { PGlite } from "@electric-sql/pglite";
import fs from "fs";
import Knex from "knex";
import { expect, test } from "vitest";
import { PGliteConnectionConfig } from "../src/pglite-dialect-context.js";
import { PGliteDialect } from "../src/pglite-dialect.js";

test("<empty string>", async () => {
  const knex = Knex({
    client: PGliteDialect,
    connection: "",
  });
  expect(await knex.raw("select 1")).toEqual({
    affectedRows: 0,
    fields: [
      {
        dataTypeID: 23,
        name: "?column?",
      },
    ],
    rows: [
      {
        "?column?": 1,
      },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  expect(knex.client.connectionSettings).toEqual({ filename: "" });
  await knex?.destroy();
});

test("memory://", async () => {
  const knex = Knex({
    client: PGliteDialect,
    connection: "memory://",
  });
  expect(await knex.raw("select 1")).toEqual({
    affectedRows: 0,
    fields: [
      {
        dataTypeID: 23,
        name: "?column?",
      },
    ],
    rows: [
      {
        "?column?": 1,
      },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  expect(knex.client.connectionSettings).toEqual({ database: "" });
  await knex?.destroy();
});

test("idb://", async () => {
  const knex = Knex({
    client: PGliteDialect,
    connection: "idb://",
  });
  expect(await knex.raw("select 1")).toEqual({
    affectedRows: 0,
    fields: [
      {
        dataTypeID: 23,
        name: "?column?",
      },
    ],
    rows: [
      {
        "?column?": 1,
      },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  expect(knex.client.connectionSettings).toEqual({ database: "" });
  await knex?.destroy();
});

test("<tempdir + uuid>", async () => {
  const tempDir: string = `temp/${crypto.randomUUID()}`;
  await fs.promises.mkdir(tempDir, { recursive: true });
  const knex = Knex({
    client: PGliteDialect,
    connection: tempDir,
  });
  expect(await knex.raw("select 1")).toEqual({
    affectedRows: 0,
    fields: [
      {
        dataTypeID: 23,
        name: "?column?",
      },
    ],
    rows: [
      {
        "?column?": 1,
      },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  expect(knex.client.connectionSettings).toEqual({ filename: tempDir });
  await knex?.destroy();
});

test("{}", async () => {
  const knex = Knex({
    client: PGliteDialect,
    connection: {},
  });
  expect(await knex.raw("select 1")).toEqual({
    affectedRows: 0,
    fields: [
      {
        dataTypeID: 23,
        name: "?column?",
      },
    ],
    rows: [
      {
        "?column?": 1,
      },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  expect(knex.client.connectionSettings).toEqual({});
  await knex?.destroy();
});

test("{pglite}", async () => {
  const knex = Knex({
    client: PGliteDialect,
    connection: {
      pglite: () => new PGlite(),
    } satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig,
  });
  expect(await knex.raw("select 1")).toEqual({
    affectedRows: 0,
    fields: [
      {
        dataTypeID: 23,
        name: "?column?",
      },
    ],
    rows: [
      {
        "?column?": 1,
      },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  expect(knex.client.connectionSettings).toEqual({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    pglite: expect.any(Function),
  });
  await knex?.destroy();
});
