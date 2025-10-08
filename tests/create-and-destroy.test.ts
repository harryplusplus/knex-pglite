import { PGlite } from "@electric-sql/pglite";
import Knex from "knex";
import { describe, expect, test } from "vitest";
import { PGliteConnectionConfig, PGliteDialect } from "../src/index.js";

describe("create with owned", () => {
  let knex: Knex.Knex;

  test("create", async () => {
    knex = Knex({
      client: PGliteDialect,
      connection: {},
    });

    expect(knex.client).toBeInstanceOf(PGliteDialect);

    const client = knex.client as PGliteDialect;
    expect(client.dialect).toBe("pglite");
    expect(client.driverName).toBe("@electric-sql/pglite");
    expect(client.getDataSource().getPGlite()).toBe(null);

    await expect(knex.raw("select 1")).resolves.not.toThrow();
  });

  test("destroy", async () => {
    await expect(knex.destroy()).resolves.not.toThrow();
  });
});

describe("create with borrowed", () => {
  let knex: Knex.Knex;
  const pglite = new PGlite();

  test("create", async () => {
    knex = Knex({
      client: PGliteDialect,
      connection: {
        pglite: () => pglite,
      } satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig,
    });

    expect(knex.client).toBeInstanceOf(PGliteDialect);

    const client = knex.client as PGliteDialect;
    expect(client.dialect).toBe("pglite");
    expect(client.driverName).toBe("@electric-sql/pglite");
    expect(client.getDataSource().getPGlite()).toBe(null);

    await expect(knex.raw("select 1")).resolves.not.toThrow();
  });

  test("destroy", async () => {
    await expect(knex.destroy()).resolves.not.toThrow();
    expect(pglite.closed).toBe(false);
    await expect(pglite.close()).resolves.not.toThrow();
  });
});

describe("create with sync", () => {
  let knex: Knex.Knex;

  test("create", async () => {
    knex = Knex({
      client: PGliteDialect,
      connection: () => {
        const connection: PGliteConnectionConfig = {};
        return connection as Knex.Knex.StaticConnectionConfig;
      },
    });

    expect(knex.client).toBeInstanceOf(PGliteDialect);

    const client = knex.client as PGliteDialect;
    expect(client.dialect).toBe("pglite");
    expect(client.driverName).toBe("@electric-sql/pglite");
    expect(client.getDataSource().getPGlite()).toBe(null);

    await expect(knex.raw("select 1")).resolves.not.toThrow();
  });

  test("destroy", async () => {
    await expect(knex.destroy()).resolves.not.toThrow();
  });
});

describe("create with async", () => {
  let knex: Knex.Knex;

  test("create", async () => {
    knex = Knex({
      client: PGliteDialect,
      connection: async () => {
        const connection: PGliteConnectionConfig = {};
        await Promise.resolve();
        return connection as Knex.Knex.StaticConnectionConfig;
      },
    });

    expect(knex.client).toBeInstanceOf(PGliteDialect);

    const client = knex.client as PGliteDialect;
    expect(client.dialect).toBe("pglite");
    expect(client.driverName).toBe("@electric-sql/pglite");
    expect(client.getDataSource().getPGlite()).toBe(null);

    await expect(knex.raw("select 1")).resolves.not.toThrow();
  });

  test("destroy", async () => {
    await expect(knex.destroy()).resolves.not.toThrow();
  });
});
