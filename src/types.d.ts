declare module "knex/lib/dialects/postgres" {
  import type { Knex } from "knex";

  export default class Client_PG extends Knex.Client {
    searchPath: unknown;
    _driver(): unknown;
    _acquireOnlyConnection(): unknown;
    _parseVersion(versionString: unknown): unknown;
    _stream(
      connection: unknown,
      obj: unknown,
      stream: unknown,
      options: unknown
    ): unknown;
    _query(connection: unknown, obj: unknown): unknown;
    processResponse(obj: unknown, runner: unknown): unknown;
    poolDefaults(): ReturnType<Knex.Client["poolDefaults"]>;
  }
}

declare module "knex/lib/knex-builder/Knex" {
  import type { Knex } from "knex";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
  export default function knex<TRecord extends {} = any, TResult = unknown[]>(
    config: Knex.Config | string
  ): Knex<TRecord, TResult>;
}
