import * as PGliteModule from "@electric-sql/pglite";
import type { Knex } from "knex";
import Client_PG from "knex/lib/dialects/postgres";
import type { PGliteConnectionConfig } from "./knex";

export interface QueryObject {
  sql?: string;
  bindings?: unknown[];
  method?: string;
  output?: (resp: unknown) => unknown;
  returning?: unknown;
  pluck?: string;
  response: Results | Results[];
}

export type Row<
  T = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  },
> = T;

export type Results<
  T = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  },
> = {
  rows: Row<T>[];
  affectedRows?: number;
  fields: {
    name: string;
    dataTypeID: number;
  }[];
  blob?: Blob;
};

export interface PGlite {
  readonly waitReady: Promise<void>;
  close(): Promise<void>;
  query<T>(
    query: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: any
  ): Promise<Results<T>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exec(query: string, options?: any): Promise<Array<Results>>;
}

// NOTE: The `client` property of the `config` parameter of the `knex` function
// in the `knex` package requires the type `typeof Knex.Client`.
// My `Client_PGlite` implementation, for convenience, avoids the need for
// users to do the boilerplate `as unknown as typeof Knex.Client`. I use
// several type assertions and `@ts-expect-error` to comply with this
// requirement.
export class Client_PGlite extends (Client_PG as unknown as typeof Knex.Client) {
  private acquireInternalPromise: Promise<PGlite> | null = null;
  private pglite: PGlite | null = null;
  private ownership: "owned" | "borrowed" | null = null;

  constructor(config: Knex.Config) {
    super(config);
  }

  /* Overrides from Knex.Client_PG */
  _driver(): typeof import("@electric-sql/pglite") {
    return PGliteModule;
  }

  /* Overrides from Knex.Client_PG */
  async _acquireOnlyConnection(): Promise<PGlite> {
    if (this.acquireInternalPromise) {
      return this.acquireInternalPromise;
    }

    this.acquireInternalPromise = this.acquireInternal();
    return this.acquireInternalPromise;
  }

  private async acquireInternal(): Promise<PGlite> {
    if (this.pglite) {
      await this.pglite.waitReady;
      return this.pglite;
    }

    const { pglite } = this.connectionSettings as PGliteConnectionConfig;
    if (!pglite) {
      this.pglite = new PGliteModule.PGlite();
      this.ownership = "owned";
    } else {
      this.pglite = pglite();
      this.ownership = "borrowed";
    }

    await this.pglite.waitReady;
    return this.pglite;
  }

  /* Overrides from Knex.Client_PG */
  override async destroyRawConnection(connection: PGlite): Promise<void> {
    if (this.ownership === "owned") {
      await connection.close();
    }

    this.acquireInternalPromise = null;
    this.pglite = null;
    this.ownership = null;
  }

  /* Overrides from Knex.Client_PG */
  async checkVersion(connection: PGlite): Promise<string> {
    const result = await connection.query("select version();");
    const row = result.rows[0] as { version?: string };
    // @ts-expect-error The `Knex.Client_PG` instance owns a `_parseVersion`
    // member method.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return this._parseVersion(row.version) as string;
  }

  /* Overrides from Knex.Client_PG */
  async setSchemaSearchPath(connection: PGlite, searchPath: string | string[]) {
    // @ts-expect-error The `Knex.Client_PG` instance owns a `searchPath`
    // member variable.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let path = searchPath || this.searchPath;

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

  /* Overrides from Knex.Client_PG */
  async _stream(
    connection: PGlite,
    obj: QueryObject,
    stream: unknown,
    _options: unknown
  ) {
    if (!obj.sql) throw new Error("The query is empty");

    const isBrowser =
      typeof window !== "undefined" && typeof window.document !== "undefined";
    if (isBrowser) {
      throw new Error("_stream is not supported in browser environments.");
    }

    // PGlite does not support query streaming. This implementation only
    // matches the interface for compatibility.
    const results = await connection.query(obj.sql, obj.bindings ?? []);
    const { Readable } = await import("stream");
    const queryStream = Readable.from(results.rows);
    return new Promise((resolve, reject) => {
      queryStream.on("error", (e) => {
        // @ts-expect-error stream is Transform instance
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        stream.emit("error", e);
        reject(e);
      });
      // @ts-expect-error stream is Transform instance
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      stream.on("end", resolve);
      // @ts-expect-error stream is Transform instance
      queryStream.pipe(stream);
    });
  }

  /* Overrides from Knex.Client_PG */
  async _query(connection: PGlite, obj: QueryObject) {
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

  getPGlite(): PGlite | null {
    return this.pglite;
  }
}

Client_PGlite.prototype.dialect = "pglite";
Client_PGlite.prototype.driverName = "@electric-sql/pglite";
