import type { PGlite } from "@electric-sql/pglite";
import type { Knex } from "knex";
import knexInternal from "knex/lib/knex-builder/Knex";
import { Client_PGlite } from "./client-pglite";

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
export function knex<TRecord extends {} = any, TResult = unknown[]>(
  config: PGliteConfig
) {
  if (!config.client) {
    config.client = Client_PGlite as unknown as string;
  }

  if (!config.connection) {
    config.connection = {};
  }

  return knexInternal<TRecord, TResult>(config as Knex.Config);
}
