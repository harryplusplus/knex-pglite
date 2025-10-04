import { PGlite } from "@electric-sql/pglite";
import { Knex } from "knex";
import { Client_PGlite, knex } from "../src";

describe("create with owned", () => {
  let inst: Knex;

  test("create", () => {
    inst = knex({});

    expect(inst.client).toBeInstanceOf(Client_PGlite);

    const client = inst.client as Client_PGlite;
    expect(client.dialect).toBe("pglite");
    expect(client.driverName).toBe("@electric-sql/pglite");
    expect(client.getPGlite()).toBe(null);
  });

  test("destroy", async () => {
    await expect(inst.destroy()).resolves.not.toThrow();
  });
});

describe("create with borrowed", () => {
  let inst: Knex;
  const pglite = new PGlite();

  test("create", () => {
    inst = knex({
      connection: {
        pglite: () => pglite,
      },
    });

    expect(inst.client).toBeInstanceOf(Client_PGlite);

    const client = inst.client as Client_PGlite;
    expect(client.dialect).toBe("pglite");
    expect(client.driverName).toBe("@electric-sql/pglite");
    expect(client.getPGlite()).toBe(null);
  });

  test("destroy", async () => {
    await expect(inst.destroy()).resolves.not.toThrow();
    await expect(pglite.close()).resolves.not.toThrow();
  });
});
