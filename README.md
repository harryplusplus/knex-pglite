# Knex.js PGlite Dialect

[![npm version](https://img.shields.io/npm/v/@harryplusplus/knex-pglite)](https://www.npmjs.com/package/@harryplusplus/knex-pglite)
[![npm downloads](https://img.shields.io/npm/dm/@harryplusplus/knex-pglite)](https://www.npmjs.com/package/@harryplusplus/knex-pglite)

A dialect for using [PGlite](https://pglite.dev/) with [Knex.js](https://knexjs.org/).

## Table of Contents

<!-- toc -->

- [Language](#language)
- [Installation](#installation)
- [Usage](#usage)
  - [Easy initialization](#easy-initialization)
  - [Injecting a PGlite instance](#injecting-a-pglite-instance)
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
# using npm
npm i knex @electric-sql/pglite @harryplusplus/knex-pglite
# using pnpm
pnpm add knex @electric-sql/pglite @harryplusplus/knex-pglite
```

> [!WARNING]  
> [Yarn](https://yarnpkg.com/) and [Bun](https://bun.com/) environments have not been tested yet for compatibility.

## Usage

### Easy initialization

Configure the `client` and `connection` properties of the Knex creation function.
The value of the `connection` property is used as the `dataDir` parameter of the PGlite constructor.

> [!NOTE]  
> For detailed specifications of `dataDir` in the PGlite constructor, please refer to the [PGlite API `dataDir`](https://pglite.dev/docs/api#datadir) documentation.

The example below shows how to do an easy initialization.

```typescript
import { PGliteDialect } from "@harryplusplus/knex-pglite";
import Knex from "knex";

const knex = Knex({
  client: PGliteDialect, // Knex PGlite Dialect

  // In-memory ephemeral storage
  connection: {},
  connection: "",
  connection: "memory://",

  // IndexedDB storage
  connection: "idb://",

  // File system storage
  connection: "/my/pglite/data",
});
```

> [!WARNING]  
> Without the `connection` property, Knex operates in **unconnected mode**.
> Since the unconnected mode works as a SQL string generator, you must define a value, even if it is an empty object, in order to use PGlite.

> [!WARNING]  
> `connection` values ​​in the form of a File URI (e.g. `file:///my/pglite/data`) cannot be used because they are not parsed in a form suitable for initializing PGlite according to the current Knex connection string parsing rules.
> Please enter the file path (e.g. `/my/pglite/data`) rather than the file URI.

### Injecting a PGlite instance

When using the [Easy initialization](#easy-initialization) method, the PGlite instance becomes **owned** by the Knex instance.
In other words, a PGlite instance shares its lifecycle with a Knex instance.

For a PGlite instance with in-memory temporary storage, sharing the lifecycle with a Knex instance may not meet your needs depending on your use case.
Additionally, various parameters for PGlite initialization cannot be utilized.

Configure the `connection.pglite` property to a synchronous or asynchronous function that returns a PGlite instance.
In this case, Knex internally considers the PGlite instance to be in a **borrowed** state.
In other words, Knex does not manage the creation and destruction of PGlite instances, since it delegates the lifecycle of PGlite instances to an external entity.

The example below shows how to inject a PGlite instance.

```typescript
import { PGlite } from "@electric-sql/pglite";
import Knex from "knex";
import {
  PGliteConnectionConfig,
  PGliteDialect,
} from "@harryplusplus/knex-pglite";

const pglite = new PGlite();

const knex = Knex({
  client: PGliteDialect,
  connection: {
    pglite: () => pglite,
  } satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig,
});
```

> [!NOTE]  
> Here's why we use `satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig`:
>
> 1. Use `satisfies PGliteConnectionConfig` to enforce the type of the `connection` property required by the Knex PGlite Dialect.
> 2. Assert that it conforms to the Knex type definition using `as Knex.Knex.StaticConnectionConfig`.

## API

Configure the following properties from the parameters of the Knex creation function:

### `client`

To use the Knex PGlite Dialect, you must specify the `PGliteDialect` class in the `client` property.

### `connection`

The type of the `connection` property is:

```typescript
export interface PGliteConnectionConfig {
  pglite?: PGliteProvider;
}
```

The following are the properties for configuring `connection`.

#### `pglite`

The type of the `pglite` attribute is:

```typescript
export interface PGliteProvider {
  (): MaybePromise<PGlite>; // (): PGlite | Promise<PGlite>
}
```

> [!NOTE]  
> To learn more about PGlite's various features, please read the [PGlite API](https://pglite.dev/docs/api) documentation.

## License

MIT
