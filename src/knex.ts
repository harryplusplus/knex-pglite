import type { Knex } from "knex";
import knexInternal from "knex/lib/knex-builder/Knex";
import { Client_PGlite, type PGlite } from "./client-pglite";

export type MaybePromise<T> = T | Promise<T>;

export type ConnectionConfigProvider<ConnectionConfig> =
  () => MaybePromise<ConnectionConfig>;

export type Connection<ConnectionConfig = never> =
  ConnectionConfig extends never
    ? string | Knex.StaticConnectionConfig | Knex.ConnectionConfigProvider
    : ConnectionConfig | ConnectionConfigProvider<ConnectionConfig>;

export interface Config<
  ConnectionConfig = never,
  Client extends typeof Knex.Client = typeof Knex.Client,
> extends Omit<Knex.Config, "client" | "connection"> {
  client?: string | Client;
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
  config?: Config<PGliteConnectionConfig, typeof Client_PGlite>
) {
  config ??= {};
  config.client ??= Client_PGlite;
  config.connection ??= {};

  return knex<PGliteConnectionConfig, TRecord, TResult, typeof Client_PGlite>(
    config
  );
}

export function knex<
  ConnectionConfig = never,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
  TRecord extends {} = any,
  TResult = unknown[],
  Client extends typeof Knex.Client = typeof Knex.Client,
>(config: string | Config<ConnectionConfig, Client>) {
  return knexInternal<TRecord, TResult>(config as Knex.Config);
}
