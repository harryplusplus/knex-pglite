import type { Knex } from "knex";
import knexInternal from "knex/lib/knex-builder/Knex";
import { Client_PGlite, type PGlite } from "./client-pglite";

export type MaybePromise<T> = T | Promise<T>;

type ConnectionConfigProvider<ConnectionConfig> =
  () => MaybePromise<ConnectionConfig>;

export type Connection<ConnectionConfig> =
  | string
  | Knex.StaticConnectionConfig
  | Knex.ConnectionConfigProvider
  | ConnectionConfig
  | ConnectionConfigProvider<ConnectionConfig>;

export interface Config<ConnectionConfig>
  extends Omit<Knex.Config, "connection"> {
  connection?: Connection<ConnectionConfig>;
}

export interface PGliteProvider {
  (): PGlite;
}

export interface PGliteConnectionConfig {
  pglite?: PGliteProvider;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
export function knexPGlite<TRecord extends {} = any, TResult = unknown[]>(
  config?: Config<PGliteConnectionConfig>
) {
  config ??= {};
  config.client ??= Client_PGlite;
  config.connection ??= {};

  return knex<TRecord, TResult, PGliteConnectionConfig>(config);
}

export function knex<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
  TRecord extends {} = any,
  TResult = unknown[],
  ConnectionConfig = unknown,
>(config: string | Config<ConnectionConfig>) {
  return knexInternal<TRecord, TResult>(config as Knex.Config);
}
