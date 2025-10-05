# Knex.js PGlite Dialect

[Knex.js](https://knexjs.org/)를 위한 [PGlite](https://pglite.dev/) 방언.

## Table of Contents

<!-- toc -->

- [언어](#%EC%96%B8%EC%96%B4)
- [설치](#%EC%84%A4%EC%B9%98)
- [사용법](#%EC%82%AC%EC%9A%A9%EB%B2%95)
  - [초기화](#%EC%B4%88%EA%B8%B0%ED%99%94)
    - [knexPGlite 함수를 사용한 방법](#knexpglite-%ED%95%A8%EC%88%98%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%9C-%EB%B0%A9%EB%B2%95)
    - [커스텀 방언 타입 지원을 위한 타입화된 knex 함수를 사용한 방법](#%EC%BB%A4%EC%8A%A4%ED%85%80-%EB%B0%A9%EC%96%B8-%ED%83%80%EC%9E%85-%EC%A7%80%EC%9B%90%EC%9D%84-%EC%9C%84%ED%95%9C-%ED%83%80%EC%9E%85%ED%99%94%EB%90%9C-knex-%ED%95%A8%EC%88%98%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%9C-%EB%B0%A9%EB%B2%95)

<!-- tocstop -->

## 언어

- [English](/README.md)
- [한국어](/README.ko.md)

## 설치

아래의 명령어를 사용해서 설치해주세요.

```sh
# npm 사용시
npm i knex @harryplusplus/knex-pglite @electric-sql/pglite
# pnpm 사용시
pnpm add knex @harryplusplus/knex-pglite @electric-sql/pglite
```

> [!WARNING]
> [Yarn](https://yarnpkg.com/)과 [Bun](https://bun.com/)은 아직 테스트하지 않았습니다.

## 사용법

### 초기화

#### knexPGlite 함수를 사용한 방법

`knexPGlite` 함수는 `knex`의 래퍼 함수입니다.
기본값으로 `client` 속성을 `Client_PGlite`로 구성합니다.

```typescript
import { knexPGlite } from "@harryplusplus/knex-pglite";

const db = knexPGlite();
```

그리고 `connection`의 타입을 `PGliteConnectionConfig`로 강제합니다.

- Static 타입일 경우

  ![knex-pglite-static](/images/knex-pglite-static.png)

- SyncProvider 타입일 경우

  ![knex-pglite-sync](/images/knex-pglite-sync.png)

- AsyncProvider 타입일 경우

  ![knex-pglite-async](/images/knex-pglite-async.png)

#### 커스텀 방언 타입 지원을 위한 타입화된 knex 함수를 사용한 방법

`knex` 함수는 타입화된 `knex`의 래퍼 함수입니다.
첫 번째 타입 매개변수로 구체화된 ConnectionConfig 타입을 받습니다.

```typescript
import {
  Client_PGlite,
  knex,
  PGliteConnectionConfig,
} from "@harryplusplus/knex-pglite";

const db = knex<PGliteConnectionConfig>({
  client: Client_PGlite,
  connection: {},
});
```

타입 매개변수로 타입을 지정했기 때문에 아래 그림처럼 `connection`의 속성이 특정됩니다.

- Static 타입일 경우

  ![typed-knex-static](/images/typed-knex-static.png)

- SyncProvider 타입일 경우

  ![typed-knex-sync](/images/typed-knex-sync.png)

- AsyncProvider 타입일 경우

  ![typed-knex-async](/images/typed-knex-async.png)

> [!NOTE]
> 타입화된 knex 함수는 다른 방언을 위해서도 사용할 수 있습니다.
> 예를 들어, `pg` 방언은 `connectionTimeoutMillis` 속성을 갖고 있습니다.
>
> ![knex-untyped-valid](/images/knex-untyped-valid.png)
>
> 하지만 실수로 `mysql` 방언의 `connectTimeout` 속성을 구성할 수도 있습니다.
>
> ![knex-untyped-invalid](/images/knex-untyped-invalid.png)
>
> 반면에 타입화된 `knex` 함수를 사용하면 타입 안전한 속성 검사를 수행할 수 있습니다.
> ![typed-knex-invalid](/images/typed-knex-invalid.png)
