# Knex.js PGlite Dialect

[Knex.js](https://knexjs.org/)를 위한 [PGlite](https://pglite.dev/) 방언.

## Table of Contents

<!-- toc -->

- [언어](#%EC%96%B8%EC%96%B4)
- [설치](#%EC%84%A4%EC%B9%98)
- [사용법](#%EC%82%AC%EC%9A%A9%EB%B2%95)
  - [초기화](#%EC%B4%88%EA%B8%B0%ED%99%94)
    - [knexPGlite 함수를 사용한 방법](#knexpglite-%ED%95%A8%EC%88%98%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%9C-%EB%B0%A9%EB%B2%95)
    - [knex의 커스텀 방언 타입 지원을 위한 타입화된 knex 함수를 사용한 방법](#knex%EC%9D%98-%EC%BB%A4%EC%8A%A4%ED%85%80-%EB%B0%A9%EC%96%B8-%ED%83%80%EC%9E%85-%EC%A7%80%EC%9B%90%EC%9D%84-%EC%9C%84%ED%95%9C-%ED%83%80%EC%9E%85%ED%99%94%EB%90%9C-knex-%ED%95%A8%EC%88%98%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%9C-%EB%B0%A9%EB%B2%95)
    - [knex 패키지 내 knex 함수를 사용한 방법](#knex-%ED%8C%A8%ED%82%A4%EC%A7%80-%EB%82%B4-knex-%ED%95%A8%EC%88%98%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%9C-%EB%B0%A9%EB%B2%95)

<!-- tocstop -->

## 언어

- [English](/README.md)
- [한국어](/README.ko.md)

## 설치

아래의 명령어를 사용해서 설치해주세요.

```sh
# npm 사용시
npm i knex @electric-sql/pglite @harryplusplus/knex-pglite
# pnpm 사용시
pnpm add knex @electric-sql/pglite @harryplusplus/knex-pglite
```

> [!WARNING]
> [Yarn](https://yarnpkg.com/)과 [Bun](https://bun.com/)은 아직 테스트하지 않았습니다.

## 사용법

### 초기화

#### knexPGlite 함수를 사용한 방법

`knexPGlite` 함수는 `knex` 패키지 내 `knex`의 래퍼 함수입니다.
기본값으로 `client` 속성을 `Client_PGlite`로 구성합니다. 아래 예제처럼 사용하실 수 있습니다.

```typescript
import { knexPGlite } from "@harryplusplus/knex-pglite";

const db = knexPGlite();
```

그리고 `connection`을 `PGliteConnectionConfig` 타입의 설정 객체(Static), 동기 함수(SyncProvider) 또는 비동기 함수(AsyncProvider)로 구성할 수 있습니다. 아래 이미지들은 타입 추론된 결과를 보여줍니다.

- 설정 객체의 경우

  ![knex-pglite-static](/images/knex-pglite-static.png)

- 동기 함수의 경우

  ![knex-pglite-sync](/images/knex-pglite-sync.png)

- 비동기 함수의 경우

  ![knex-pglite-async](/images/knex-pglite-async.png)

#### knex의 커스텀 방언 타입 지원을 위한 타입화된 knex 함수를 사용한 방법

`@harryplusplus/knex-pglite` 패키지 내 `knex` 함수는 `knex` 패키지 내 `knex` 함수의 타입화된 래퍼(wrapper)입니다.
첫 번째 타입 매개변수로 구체화된 ConnectionConfig 타입을 받습니다. 아래 예제처럼 타입화된 knex 함수를 사용해 PGlite 방언을 구성할 수 있습니다.

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

타입화된 knex 함수의 타입 매개변수로 연결 구성 타입을 지정했기 때문에 아래 그림처럼 `connection`의 속성이 특정됩니다.

- 설정 객체의 경우

  ![typed-knex-static](/images/typed-knex-static.png)

- 동기 함수의 경우

  ![typed-knex-sync](/images/typed-knex-sync.png)

- 비동기 함수의 경우

  ![typed-knex-async](/images/typed-knex-async.png)

> [!NOTE]
> 타입화된 knex 함수는 다른 방언을 위해서도 사용할 수 있습니다.
> 예를 들어, 아래 그림처럼 PostgreSQL을 위한 `pg` 방언은 `connection`의 속성으로 `connectionTimeoutMillis`를 갖고 있습니다.
>
> ![knex-untyped-valid](/images/knex-untyped-valid.png)
>
> 하지만 비슷한 이름의 다른 방언을 위한 속성이 많습니다. 실수로 MySQL을 위한 `mysql` 방언의 `connectTimeout` 속성을 구성하고 `pg`의 `connectionTimeoutMillis`를 구성하지 않을 수도 있습니다. 이 경우 빌드 시점에 인지하기 어렵고 실행 시점에 구성 로그를 확인해야할 수도 있습니다.
>
> ![knex-untyped-invalid](/images/knex-untyped-invalid.png)
>
> 반면에 타입화된 knex 함수를 사용하면 엄격한 타입 검사를 수행할 수 있기 때문에, 허용되지 않은 `connectTimeout` 속성을 빌드 시점에 검증할 수 있습니다.
> ![typed-knex-invalid](/images/typed-knex-invalid.png)

#### knex 패키지 내 knex 함수를 사용한 방법
