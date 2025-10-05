import type { Client, Knex } from "knex";
import knex from "knex/lib/knex-builder/Knex";
import { Client_PGlite, type PGlite } from "./client-pglite";

export type MaybePromise<T> = T | Promise<T>;

export interface PGliteProvider {
  (): PGlite;
}

export interface PGliteConnectionConfig {
  pglite?: PGliteProvider;
}

type PGliteConnectionConfigProvider =
  () => MaybePromise<PGliteConnectionConfig>;

export type PGliteConnection =
  | PGliteConnectionConfig
  | PGliteConnectionConfigProvider;

export interface PGliteConfig extends Omit<Knex.Config, "connection"> {
  connection?: PGliteConnection;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
export function knexPGlite<TRecord extends {} = any, TResult = unknown[]>(
  config?: PGliteConfig
) {
  config ??= {};
  config.client ??= Client_PGlite as unknown as typeof Client;
  config.connection ??= {};

  return knex<TRecord, TResult>(config as Knex.Config);
}
