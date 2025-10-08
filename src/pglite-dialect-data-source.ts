import type { PGliteInterface } from "@electric-sql/pglite";
import { PGliteConnectionSettings } from "./pglite-dialect-functions.js";

export class PGliteDialectDataSource {
  private acquirePromise: Promise<PGliteInterface> | null = null;
  private pglite: PGliteInterface | null = null;
  private ownership: "owned" | "borrowed" | null = null;

  /**
   * To override Knex.Client_PG._acquireOnlyConnection
   */
  _acquireOnlyConnection(client: {
    getConnectionSettings(): unknown;
  }): Promise<PGliteInterface> {
    if (this.acquirePromise) {
      return this.acquirePromise;
    }

    this.acquirePromise = this.acquire(client);
    return this.acquirePromise;
  }

  /**
   * To override Knex.Client_PG.destroyRawConnection
   */
  async destroyRawConnection(connection: PGliteInterface): Promise<void> {
    if (this.ownership === "owned") {
      await connection.close();
    }

    this.pglite = null;
    this.ownership = null;
    this.acquirePromise = null;
  }

  getPGlite(): PGliteInterface | null {
    return this.pglite;
  }

  private async acquire(client: {
    getConnectionSettings(): unknown;
  }): Promise<PGliteInterface> {
    if (this.pglite) {
      await this.pglite.waitReady;
      return this.pglite;
    }

    const { filename, database, pglite } =
      client.getConnectionSettings() as PGliteConnectionSettings;
    if (pglite) {
      this.pglite = await pglite();
      this.ownership = "borrowed";
    } else {
      const { PGlite } = await import("@electric-sql/pglite");
      const dataDir = filename ?? database ?? "";
      this.pglite = new PGlite(dataDir);
      this.ownership = "owned";
    }

    if (!this.pglite) {
      throw new Error("The pglite must exist.");
    }

    await this.pglite.waitReady;
    return this.pglite;
  }
}
