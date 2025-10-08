import { PGliteInterface } from "@electric-sql/pglite";
import type { Knex } from "knex";
import {
  _query,
  _stream,
  checkVersion,
  patchPGliteDialect,
  poolDefaults,
  PoolDefaults,
  processResponse,
  QueryObject,
  setSchemaSearchPath,
} from "./pglite-dialect-functions.js";

// @ts-expect-error Based on knex@3.1.0
import Client_PG from "knex/lib/dialects/postgres/index.js";
import { PGliteDialectDataSource } from "./pglite-dialect-data-source.js";

export class PGliteDialect extends (Client_PG as unknown as typeof Knex.Client) {
  declare searchPath?: unknown;
  declare _parseVersion?: (version: unknown) => unknown;

  /**
   * The driver has its own data source for each pglite dialect.
   */
  _driver(): PGliteDialectDataSource {
    return new PGliteDialectDataSource();
  }

  getDataSource(): PGliteDialectDataSource {
    return this.driver as PGliteDialectDataSource;
  }

  _acquireOnlyConnection(): Promise<PGliteInterface> {
    return this.getDataSource()._acquireOnlyConnection({
      getConnectionSettings: () => this.connectionSettings,
    });
  }

  override destroyRawConnection(connection: PGliteInterface): Promise<void> {
    return this.getDataSource().destroyRawConnection(connection);
  }

  checkVersion(connection: PGliteInterface): Promise<string> {
    return checkVersion(
      {
        parseVersion: (version) => this._parseVersion?.(version),
      },
      connection
    );
  }

  setSchemaSearchPath(
    connection: PGliteInterface,
    searchPath: string | string[]
  ) {
    return setSchemaSearchPath(
      {
        getSearchPath: () => this.searchPath,
        warn: (message) => this.logger.warn?.(message),
      },
      connection,
      searchPath
    );
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
