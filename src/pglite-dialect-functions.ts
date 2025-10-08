import type { PGliteInterface, Results } from "@electric-sql/pglite";

export interface Constructor<T = unknown> {
  new (...args: any[]): T;
}

export type MaybePromise<T> = T | Promise<T>;

export interface PGliteProvider {
  (): MaybePromise<PGliteInterface>;
}

export interface PGliteConnectionConfig {
  pglite?: PGliteProvider;
}

export interface PGliteConnectionSettings extends PGliteConnectionConfig {
  filename?: string;
  database?: string;
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

/**
 * To override Knex.Client_PG.setSchemaSearchPath
 */
export async function setSchemaSearchPath(
  client: {
    getSearchPath(): unknown;
    warn(message: unknown): void;
  },
  connection: PGliteInterface,
  searchPath: unknown
): Promise<boolean> {
  const pathOrList = searchPath || client.getSearchPath();
  if (!pathOrList) {
    return true;
  }

  if (!Array.isArray(pathOrList) && typeof pathOrList !== "string") {
    throw new TypeError(
      `knex: Expected searchPath to be Array/String, got: ${typeof pathOrList}`
    );
  }

  const paths: string[] = [];
  if (typeof pathOrList === "string") {
    const path = pathOrList;
    if (path.includes(",")) {
      const parts = path.split(",");
      const arraySyntax = `[${parts
        .map((searchPath) => `'${searchPath}'`)
        .join(", ")}]`;
      client.warn(
        `Detected comma in searchPath "${path}".` +
          `If you are trying to specify multiple schemas, use Array syntax: ${arraySyntax}`
      );
    }

    paths.push(path);
  } else {
    paths.push(
      ...pathOrList.map((x) => {
        if (typeof x !== "string") {
          throw new Error(
            `The pathOrList must be string type. type: ${typeof x}`
          );
        }

        return x;
      })
    );
  }

  const path = paths.map((schemaName) => `"${schemaName}"`).join(",");
  await connection.query(`set search_path to ${path}`);
  return true;
}

/**
 * To override Knex.Client_PG.checkVersion
 */
export async function checkVersion(
  client: {
    parseVersion: (version: unknown) => unknown;
  },
  connection: PGliteInterface
): Promise<string> {
  const { rows } = await connection.query("select version()");
  if (rows.length < 1) {
    throw new Error("Invalid select version result length.");
  }

  const row = rows[0];
  if (
    !row ||
    typeof row !== "object" ||
    !("version" in row) ||
    typeof row.version !== "string"
  ) {
    throw new Error("Invalid select version row shape.");
  }

  const { version } = row;
  const versionString = client.parseVersion(version);

  if (typeof versionString !== "string") {
    throw new Error("The versionString must be string type.");
  }

  return versionString;
}

/**
 * To override Knex.Client_PG._stream
 * PGlite does not support query streaming. This implementation only matches
 * the interface for compatibility.
 */
export async function _stream(
  connection: PGliteInterface,
  obj: QueryObject,
  stream: NodeJS.WritableStream,
  _options: unknown
): Promise<void> {
  return new Promise<void>((resolve, _reject) => {
    const reject = (e: Error) => {
      _reject(e);
      stream.emit("error", e);
    };

    (async () => {
      if (!obj.sql) {
        throw new Error("The query is empty.");
      }

      const { rows } = await connection.query(obj.sql, obj.bindings ?? []);
      const { Readable } = await import("stream");
      const readable = Readable.from(rows);
      readable.on("error", reject);
      stream.on("end", resolve);
      readable.pipe(stream);
    })().catch(reject);
  });
}

/**
 * To override Knex.Client_PG._query
 */
export async function _query(
  connection: PGliteInterface,
  obj: QueryObject
): Promise<QueryObject> {
  if (!obj.sql) {
    throw new Error("The query is empty");
  }

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

/**
 * To override Knex.Client_PG.processResponse
 */
export function processResponse(obj: QueryObject, runner: unknown): unknown {
  const resp = obj.response;
  if (obj.output) {
    return obj.output.call(runner, resp);
  }

  if (obj.method === "raw" || Array.isArray(resp)) {
    return resp;
  }

  const { returning } = obj;
  if (obj.method === "select") {
    return resp.rows;
  }

  if (obj.method === "first") {
    return resp.rows[0];
  }

  if (obj.method === "pluck") {
    if (!obj.pluck) {
      throw new Error("The query object has no pluck value.");
    }

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

export interface PoolDefaults {
  min: number;
  max: number;
  propagateCreateError: boolean;
}

/**
 * To override Knex.Client.poolDefaults
 */
export function poolDefaults(): PoolDefaults {
  return { min: 1, max: 1, propagateCreateError: true };
}

export const PATCH_FLAG = "__pgliteDialectPatched";

export const PATCH_INFOS = [
  { key: "dialect", value: "pglite" },
  { key: "driverName", value: "@electric-sql/pglite" },
];

export function patchPGliteDialect(constructor: Constructor): void {
  if (Reflect.has(constructor.prototype as object, PATCH_FLAG)) {
    return;
  }

  PATCH_INFOS.forEach(({ key, value }) => {
    Reflect.set(constructor.prototype, key, value);
  });

  Reflect.set(constructor.prototype, PATCH_FLAG, true);
}
