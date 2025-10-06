import { type PGlite } from "./client-pglite.js";

export type MaybePromise<T> = T | Promise<T>;

export interface PGliteProvider {
  (): MaybePromise<PGlite>;
}

export interface PGliteConnectionConfig {
  pglite?: PGliteProvider;
}
