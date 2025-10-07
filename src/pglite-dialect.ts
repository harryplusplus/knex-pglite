import { PGliteInterface } from "@electric-sql/pglite";
import type { Knex } from "knex";
import {
  PGliteDialectCore,
  PoolDefaults,
  QueryObject,
} from "./pglite-dialect-core.js";

// @ts-expect-error Based on knex@3.1.0
import Client_PG from "knex/lib/dialects/postgres/index.js";

export class PGliteDialect extends (Client_PG as unknown as typeof Knex.Client) {
  private core: PGliteDialectCore;

  constructor(config: Knex.Config) {
    super(config);

    this.core = new PGliteDialectCore({
      getConnectionSettings: () => this.connectionSettings,
      getSearchPath: () => {
        if (
          !("searchPath" in this) ||
          typeof this.searchPath !== "string" ||
          Array.isArray(this.searchPath)
        ) {
          return null;
        }

        return this.searchPath;
      },
      parseVersion: (version) => {
        if (
          !("_parseVersion" in this) ||
          typeof this._parseVersion !== "function"
        ) {
          throw new Error("this._parseVersion must exist.");
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const parsedVersion = this._parseVersion(version);
        if (typeof parsedVersion !== "string") {
          throw new Error("The version must be string type.");
        }

        return parsedVersion;
      },
      log: (level, message) => {
        if (level === "warn") {
          this.logger.warn?.(message);
        } else {
          this.logger.debug?.(message);
        }
      },
    });
  }

  _driver(): null {
    return PGliteDialectCore._driver();
  }

  _acquireOnlyConnection(): Promise<PGliteInterface> {
    return this.core._acquireOnlyConnection();
  }

  override destroyRawConnection(connection: PGliteInterface): Promise<void> {
    return this.core.destroyRawConnection(connection);
  }

  checkVersion(connection: PGliteInterface): Promise<string> {
    return this.core.checkVersion(connection);
  }

  setSchemaSearchPath(
    connection: PGliteInterface,
    searchPath: string | string[]
  ) {
    return this.core.setSchemaSearchPath(connection, searchPath);
  }

  _stream(
    connection: PGliteInterface,
    obj: QueryObject,
    stream: NodeJS.WritableStream,
    options: unknown
  ) {
    return this.core._stream(connection, obj, stream, options);
  }

  _query(connection: PGliteInterface, obj: QueryObject): Promise<QueryObject> {
    return this.core._query(connection, obj);
  }

  processResponse(obj: QueryObject, runner: unknown): unknown {
    return this.core.processResponse(obj, runner);
  }

  override poolDefaults(): PoolDefaults {
    return PGliteDialectCore.poolDefaults();
  }

  getPGlite(): PGliteInterface | null {
    return this.core.getPGlite();
  }
}

PGliteDialectCore.patch(PGliteDialect, { force: true });
