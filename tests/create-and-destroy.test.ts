import { PGlite } from "@electric-sql/pglite";
import { describe, expect, test } from "@jest/globals";
import knex, { Knex } from "knex";
import {
  Client_PGlite,
  knexPGlite,
  PGliteConnectionConfig,
  knex as typedKnex,
} from "../src";

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
    expect(pglite.closed).toBe(false);
    await expect(pglite.close()).resolves.not.toThrow();
  });
});

describe("create clone with borrowed", () => {
  let db: Knex;
  const pglite = new PGlite();

  test("create clone", async () => {
    db = knexPGlite({
      connection: {
        pglite: () => pglite.clone(),
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
    expect(pglite.closed).toBe(false);
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
      client: Client_PGlite,
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
      client: Client_PGlite,
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
      client: Client_PGlite,
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

describe("create with typed knex static", () => {
  let db: Knex;

  test("create", async () => {
    db = typedKnex({
      client: Client_PGlite,
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

describe("create with typed knex sync", () => {
  let db: Knex;

  test("create", async () => {
    db = typedKnex({
      client: Client_PGlite,
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

describe("create with typed knex async", () => {
  let db: Knex;

  test("create", async () => {
    db = typedKnex({
      client: Client_PGlite,
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
