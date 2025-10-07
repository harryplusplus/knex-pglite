# Knex.js PGlite Dialect

A dialect for using [PGlite](https://pglite.dev/) with [Knex.js](https://knexjs.org/).

## Table of Contents

<!-- toc -->

- [Language](#language)
- [Installation](#installation)
- [Usage](#usage)
  - [Default in-memory mode](#default-in-memory-mode)
  - [Injecting a PGlite instance](#injecting-a-pglite-instance)
    - [Why inject a PGlite instance](#why-inject-a-pglite-instance)
    - [Isolated identical data across unit tests](#isolated-identical-data-across-unit-tests)
    - [Why use `satisfies` and `as` in `connection` property](#why-use-satisfies-and-as-in-connection-property)
    - [Loading a dump](#loading-a-dump)
- [API](#api)
  - [`client`](#client)
  - [`connection`](#connection)
    - [`pglite`](#pglite)
- [License](#license)

<!-- tocstop -->

## Language

- [English](/README.md)
- [한국어](/README.ko.md)

## Installation

Install with the following commands.

```sh
# npm
npm i knex @electric-sql/pglite @harryplusplus/knex-pglite
# pnpm
pnpm add knex @electric-sql/pglite @harryplusplus/knex-pglite
```

> [!WARNING]
> [Yarn](https://yarnpkg.com/) and [Bun](https://bun.com/) environments have not been tested yet for compatibility.

## Usage

### Default in-memory mode

To use PGlite in default in-memory mode, initialize Knex as follows.

```typescript
import { PGliteDialect } from "@harryplusplus/knex-pglite";
import Knex from "knex";

const knex = Knex({
  client: PGliteDialect, // You must configure this to use the Knex PGlite dialect.
  connection: {}, // It must be initialized as a minimally empty object for PGlite connections, not for SQL generation.
});
```

With the configuration above, the PGlite instance is created inside the Knex instance and shares Knex’s lifecycle, which is sufficient for most scenarios.

> [!NOTE]
> When `connection` is an empty object, the dialect internally calls the default PGlite constructor (`new PGlite()`).

If more control is needed for data dumps, reuse, or isolation, see [Injecting a PGlite instance](#injecting-a-pglite-instance) below.

### Injecting a PGlite instance

#### Why inject a PGlite instance

PGlite is a single-instance embedded Postgres that runs locally in WebAssembly or on a chosen filesystem, differing from traditional client-server databases that run over network connections or disk-based services.
[Default in-memory mode](#default-in-memory-mode) Creating PGlite inside a Knex instance is analogous to spinning up the server within the client; when the Knex instance is disposed, the PGlite instance is disposed as well.
For use cases like dumping/loading state or reusing identical seed data across isolated runs, injecting a managed PGlite instance can be beneficial.

#### Isolated identical data across unit tests

The example below initializes a base PGlite with prepared test data and uses `pglite.clone()` to create isolated environments efficiently.

```typescript
import { PGlite } from "@electric-sql/pglite";
import {
  PGliteDialect,
  PGliteConnectionConfig,
} from "@harryplusplus/knex-pglite";
import Knex from "knex";

async function doTestSuite() {
  const pglite = new PGlite();
  // Prepare data...
  await Promise.all([doUnitTest1(pglite), doUnitTest2(pglite)]);
}

async function doUnitTest1(pglite: PGlite) {
  const knex = Knex({
    client: PGliteDialect,
    connection: {
      pglite: () => pglite.clone(), // Copy data to an isolated environment
    } satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig,
  });
  // Run tests...
}

async function doUnitTest2(pglite: PGlite) {
  const knex = Knex({
    client: PGliteDialect,
    connection: {
      pglite: () => pglite.clone(), // Copy data to an isolated environment
    } satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig,
  });
  // Run tests...
}
```

#### Why use `satisfies` and `as` in `connection` property

You should use `satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig` on the connection property for the following reasons:

1. Strictly check the `connection` object via `satisfies PGliteConnectionConfig` for safer compile-time guarantees.
2. Cast to `Knex.Knex.StaticConnectionConfig` to match Knex’s configuration contract at the boundary with the custom dialect.

#### Loading a dump

PGlite can restore a database from a dump created by `dumpDataDir`; pass that dump (file or directory) to `loadDataDir` during initialization to preload state.

```typescript
import { PGlite } from "@electric-sql/pglite";
import {
  PGliteDialect,
  PGliteConnectionConfig,
} from "@harryplusplus/knex-pglite";
import Knex from "knex";

async function doTest(data: File) {
  const knex = Knex({
    client: PGliteDialect,
    connection: {
      pglite: () =>
        new PGlite({
          loadDataDir: data, // Load the dump into the database
        }),
    } satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig,
  });
  // Run tests...
}
```

## API

When initializing Knex, configure the following properties on the `config` object.

### `client`

Set `client` to `PGliteDialect` to enable this dialect in Knex.

Example:

```typescript
import { PGliteDialect } from "@harryplusplus/knex-pglite";
import Knex from "knex";

const knex = Knex({
  client: PGliteDialect,
  // ...
});
```

### `connection`

Type definition:

```typescript
export interface PGliteConnectionConfig {
  pglite?: PGliteProvider;
}
```

The following property defines how the dialect obtains a PGlite instance.

#### `pglite`

Register a synchronous or asynchronous provider function that returns a PGlite instance; when omitted, the dialect falls back to [Default in-memory mode](#default-in-memory-mode) as described above.

```typescript
export interface PGliteProvider {
  (): MaybePromise<PGlite>; // (): PGlite | Promise<PGlite>
}
```

Example:

```typescript
import { PGlite } from "@electric-sql/pglite";
import {
  PGliteDialect,
  PGliteConnectionConfig,
} from "@harryplusplus/knex-pglite";
import Knex from "knex";

const pglite = new PGlite();
const knex = Knex({
  client: PGliteDialect,
  // Default in-memory mode:
  // connection: {}, // It must be initialized as a minimally empty object for PGlite connections, not for SQL generation.

  // Injecting a PGlite instance
  connection: {
    pglite: () => pglite, // Inject a PGlite instance.
  } satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig,
});
```

> [!NOTE]
> To learn more about PGlite's various features, please read the [PGlite API](https://pglite.dev/docs/api) documentation.

## License

MIT
