import { type Knex } from "knex";
import { Client_PGlite, type PGlite } from "./client-pglite";

export type MaybePromise<T> = T | Promise<T>;

export interface PGliteProvider {
  (): MaybePromise<PGlite>;
}

export interface PGliteConnectionConfig {
  pglite?: PGliteProvider;
}

export type ConnectionConfigProvider<ConnectionConfig> =
  () => MaybePromise<ConnectionConfig>;

export type ConnectionConfigOrProvider<ConnectionConfig> =
  | ConnectionConfig
  | ConnectionConfigProvider<ConnectionConfig>;

export interface Config extends Omit<Knex.Config, "connection"> {
  connection?: ConnectionConfigOrProvider<PGliteConnectionConfig>;
}

export function defineConfig(config?: Config): Knex.Config {
  config ??= {};
  config.client ??= Client_PGlite;
  config.connection ??= {};
  return config as Knex.Config;
}
