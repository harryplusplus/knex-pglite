import { PGlite } from "@electric-sql/pglite";
import knex, { Knex } from "knex";
import { Client_PGlite, knexPGlite, PGliteConnectionConfig } from "../src";

describe("create with owned", () => {
  let db: Knex;

  test("create", async () => {
    db = knexPGlite();

    expect(db.client).toBeInstanceOf(Client_PGlite);

    const client = db.client as Client_PGlite;
    expect(client.dialect).toBe("pglite");
    expect(client.driverName).toBe("@electric-sql/pglite");
    expect(client.getPGlite()).toBe(null);

    await expect(db.raw("select 1")).resolves.not.toThrow();
  });

  test("destroy", async () => {
    await expect(db.destroy()).resolves.not.toThrow();
  });
});

describe("create with borrowed", () => {
  let db: Knex;
  const pglite = new PGlite();

  test("create", async () => {
    db = knexPGlite({
      connection: {
        pglite: () => pglite,
      },
    });

    expect(db.client).toBeInstanceOf(Client_PGlite);

    const client = db.client as Client_PGlite;
    expect(client.dialect).toBe("pglite");
    expect(client.driverName).toBe("@electric-sql/pglite");
    expect(client.getPGlite()).toBe(null);

    await expect(db.raw("select 1")).resolves.not.toThrow();
  });

  test("destroy", async () => {
    await expect(db.destroy()).resolves.not.toThrow();
    await expect(pglite.close()).resolves.not.toThrow();
  });
});

describe("create with sync", () => {
  let db: Knex;

  test("create", async () => {
    db = knexPGlite({
      connection: () => {
        const connection: PGliteConnectionConfig = {};
        return connection;
      },
    });

    expect(db.client).toBeInstanceOf(Client_PGlite);

    const client = db.client as Client_PGlite;
    expect(client.dialect).toBe("pglite");
    expect(client.driverName).toBe("@electric-sql/pglite");
    expect(client.getPGlite()).toBe(null);

    await expect(db.raw("select 1")).resolves.not.toThrow();
  });

  test("destroy", async () => {
    await expect(db.destroy()).resolves.not.toThrow();
  });
});

describe("create with async", () => {
  let db: Knex;

  test("create", async () => {
    db = knexPGlite({
      connection: async () => {
        const connection: PGliteConnectionConfig = {};
        await Promise.resolve();
        return connection;
      },
    });

    expect(db.client).toBeInstanceOf(Client_PGlite);

    const client = db.client as Client_PGlite;
    expect(client.dialect).toBe("pglite");
    expect(client.driverName).toBe("@electric-sql/pglite");
    expect(client.getPGlite()).toBe(null);

    await expect(db.raw("select 1")).resolves.not.toThrow();
  });

  test("destroy", async () => {
    await expect(db.destroy()).resolves.not.toThrow();
  });
});

describe("create with knex static", () => {
  let db: Knex;

  test("create", async () => {
    db = knex({
      client: Client_PGlite as unknown as typeof Knex.Client,
      connection: {},
    });

    expect(db.client).toBeInstanceOf(Client_PGlite);

    const client = db.client as Client_PGlite;
    expect(client.dialect).toBe("pglite");
    expect(client.driverName).toBe("@electric-sql/pglite");
    expect(client.getPGlite()).toBe(null);

    await expect(db.raw("select 1")).resolves.not.toThrow();
  });

  test("destroy", async () => {
    await expect(db.destroy()).resolves.not.toThrow();
  });
});

describe("create with knex sync", () => {
  let db: Knex;

  test("create", async () => {
    db = knex({
      client: Client_PGlite as unknown as typeof Knex.Client,
      connection: (() => {
        const connection: PGliteConnectionConfig = {};
        return connection;
      }) as Knex.SyncConnectionConfigProvider,
    });

    expect(db.client).toBeInstanceOf(Client_PGlite);

    const client = db.client as Client_PGlite;
    expect(client.dialect).toBe("pglite");
    expect(client.driverName).toBe("@electric-sql/pglite");
    expect(client.getPGlite()).toBe(null);

    await expect(db.raw("select 1")).resolves.not.toThrow();
  });

  test("destroy", async () => {
    await expect(db.destroy()).resolves.not.toThrow();
  });
});

describe("create with knex async", () => {
  let db: Knex;

  test("create", async () => {
    db = knex({
      client: Client_PGlite as unknown as typeof Knex.Client,
      connection: (async () => {
        const connection: PGliteConnectionConfig = {};
        await Promise.resolve();
        return connection;
      }) as Knex.AsyncConnectionConfigProvider,
    });

    expect(db.client).toBeInstanceOf(Client_PGlite);

    const client = db.client as Client_PGlite;
    expect(client.dialect).toBe("pglite");
    expect(client.driverName).toBe("@electric-sql/pglite");
    expect(client.getPGlite()).toBe(null);

    await expect(db.raw("select 1")).resolves.not.toThrow();
  });

  test("destroy", async () => {
    await expect(db.destroy()).resolves.not.toThrow();
  });
});
