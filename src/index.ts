import type { PGliteInterface, Results } from "@electric-sql/pglite";
import type { Knex } from "knex";
import Client_PG from "knex/lib/dialects/postgres/index.js";
import type { Transform } from "stream";

export type MaybePromise<T> = T | Promise<T>;

export interface PGliteProvider {
  (): MaybePromise<PGliteInterface>;
}

export interface PGliteConnectionConfig {
  pglite?: PGliteProvider;
}

export interface QueryObject {
  sql?: string;
  bindings?: unknown[];
  method?: string;
  output?: (resp: unknown) => unknown;
  returning?: unknown;
  pluck?: string;
  response: Results | Results[];
}

export class Client_PGlite extends (Client_PG as unknown as typeof Knex.Client) {
  private acquireInternalPromise: Promise<PGliteInterface> | null = null;
  private pglite: PGliteInterface | null = null;
  private ownership: "owned" | "borrowed" | null = null;

  constructor(config: Knex.Config) {
    super(config);
  }

  /* Overrides from Knex.Client_PG */
  _driver(): null {
    return null;
  }

  /* Overrides from Knex.Client_PG */
  _acquireOnlyConnection(): Promise<PGliteInterface> {
    if (this.acquireInternalPromise) {
      return this.acquireInternalPromise;
    }

    this.acquireInternalPromise = this.acquireInternal();
    return this.acquireInternalPromise;
  }

  private async acquireInternal(): Promise<PGliteInterface> {
    if (this.pglite) {
      await this.pglite.waitReady;
      return this.pglite;
    }

    const { pglite } = this.connectionSettings as PGliteConnectionConfig;
    if (!pglite) {
      const { PGlite } = await import("@electric-sql/pglite");
      this.pglite = new PGlite();
      this.ownership = "owned";
    } else {
      this.pglite = await pglite();
      this.ownership = "borrowed";
    }

    if (!this.pglite) {
      throw new Error("this.pglite must exist.");
    }

    await this.pglite.waitReady;
    return this.pglite;
  }

  /* Overrides from Knex.Client_PG */
  override async destroyRawConnection(
    connection: PGliteInterface
  ): Promise<void> {
    if (this.ownership === "owned") {
      await connection.close();
    }

    this.acquireInternalPromise = null;
    this.pglite = null;
    this.ownership = null;
  }

  /* Overrides from Knex.Client_PG */
  async checkVersion(connection: PGliteInterface): Promise<string> {
    const result = await connection.query("select version();");
    const row = result.rows[0] as { version?: string };
    if (
      !("_parseVersion" in this) ||
      typeof this._parseVersion !== "function"
    ) {
      throw new Error("this._parseVersion must exist.");
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return this._parseVersion(row.version) as string;
  }

  /* Overrides from Knex.Client_PG */
  async setSchemaSearchPath(
    connection: PGliteInterface,
    searchPath: string | string[]
  ) {
    let path = searchPath || ("searchPath" in this && this.searchPath);

    if (!path) return Promise.resolve(true);

    if (!Array.isArray(path) && typeof path !== "string") {
      throw new TypeError(
        `knex: Expected searchPath to be Array/String, got: ${typeof path}`
      );
    }

    if (typeof path === "string") {
      if (path.includes(",")) {
        const parts = path.split(",");
        const arraySyntax = `[${parts
          .map((searchPath) => `'${searchPath}'`)
          .join(", ")}]`;
        this.logger.warn?.(
          `Detected comma in searchPath "${path}".` +
            `If you are trying to specify multiple schemas, use Array syntax: ${arraySyntax}`
        );
      }
      path = [path];
    }

    path = (path as string[]).map((schemaName) => `"${schemaName}"`).join(",");

    const result = await connection.query(
      `set search_path to ${path as string}`
    );
    return result;
  }

  // NOTE: PGlite does not support query streaming. This implementation only
  // matches the interface for compatibility.
  /* Overrides from Knex.Client_PG */
  async _stream(
    connection: PGliteInterface,
    obj: QueryObject,
    stream: unknown,
    _options: unknown
  ) {
    return new Promise<void>((resolve, _reject) => {
      const writable = stream as Transform;

      const reject = (e: Error) => {
        _reject(e);
        writable.emit("error", e);
      };

      (async () => {
        if (!obj.sql) throw new Error("The query is empty");

        const { rows } = await connection.query(obj.sql, obj.bindings ?? []);
        const { Readable } = await import("stream");
        const readable = Readable.from(rows);
        readable.on("error", reject);
        writable.on("end", resolve);
        readable.pipe(writable);
      })().catch(reject);
    });
  }

  /* Overrides from Knex.Client_PG */
  async _query(connection: PGliteInterface, obj: QueryObject) {
    if (!obj.sql) throw new Error("The query is empty");

    const isMultiStatements =
      obj.method === "raw" &&
      obj.sql.split(";").filter((x) => x.trim().length !== 0).length > 1;
    if (isMultiStatements) {
      obj.response = await connection.exec(obj.sql);
    } else {
      obj.response = await connection.query(obj.sql, obj.bindings ?? []);
    }

    return obj;
  }

  /* Overrides from Knex.Client_PG */
  processResponse(obj: QueryObject, runner: unknown) {
    const resp = obj.response;
    if (obj.output) return obj.output.call(runner, resp);
    if (obj.method === "raw" || Array.isArray(resp)) return resp;
    const { returning } = obj;
    if (obj.method === "select") return resp.rows;
    if (obj.method === "first") return resp.rows[0];
    if (obj.method === "pluck") {
      return resp.rows.map((x) => x[obj.pluck!] as unknown);
    }
    if (returning) {
      const returns = [];
      for (let i = 0, l = resp.rows.length; i < l; i++) {
        const row = resp.rows[i];
        returns[i] = row;
      }
      return returns;
    }
    if (obj.method === "update" || obj.method === "del") {
      return resp.affectedRows;
    }
    return resp;
  }

  /* Overrides from Knex.Client */
  override poolDefaults(): ReturnType<Knex.Client["poolDefaults"]> {
    return { min: 1, max: 1, propagateCreateError: true };
  }

  getPGlite(): PGliteInterface | null {
    return this.pglite;
  }
}

Client_PGlite.prototype.dialect = "pglite";
Client_PGlite.prototype.driverName = "@electric-sql/pglite";
