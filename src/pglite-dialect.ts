import { PGliteInterface } from "@electric-sql/pglite";
import type { Knex } from "knex";
import {
  _query,
  _stream,
  patchPGliteDialect,
  PGliteDialectContext,
  poolDefaults,
  PoolDefaults,
  processResponse,
  QueryObject,
} from "./pglite-dialect-context.js";

// @ts-expect-error Based on knex@3.1.0
import Client_PG from "knex/lib/dialects/postgres/index.js";

export class PGliteDialect extends (Client_PG as unknown as typeof Knex.Client) {
  /**
   * The driver has its own state for each pglite dialect.
   */
  _driver(): PGliteDialectContext {
    return new PGliteDialectContext({
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

  getContext(): PGliteDialectContext {
    return this.driver as PGliteDialectContext;
  }

  _acquireOnlyConnection(): Promise<PGliteInterface> {
    return this.getContext()._acquireOnlyConnection();
  }

  override destroyRawConnection(connection: PGliteInterface): Promise<void> {
    return this.getContext().destroyRawConnection(connection);
  }

  checkVersion(connection: PGliteInterface): Promise<string> {
    return this.getContext().checkVersion(connection);
  }

  setSchemaSearchPath(
    connection: PGliteInterface,
    searchPath: string | string[]
  ) {
    return this.getContext().setSchemaSearchPath(connection, searchPath);
  }

  _stream(
    connection: PGliteInterface,
    obj: QueryObject,
    stream: NodeJS.WritableStream,
    options: unknown
  ) {
    return _stream(connection, obj, stream, options);
  }

  _query(connection: PGliteInterface, obj: QueryObject): Promise<QueryObject> {
    return _query(connection, obj);
  }

  processResponse(obj: QueryObject, runner: unknown): unknown {
    return processResponse(obj, runner);
  }

  override poolDefaults(): PoolDefaults {
    return poolDefaults();
  }
}

patchPGliteDialect(PGliteDialect);
