# Knex.js PGlite Dialect

[![npm version](https://img.shields.io/npm/v/@harryplusplus/knex-pglite)](https://www.npmjs.com/package/@harryplusplus/knex-pglite)
[![npm downloads](https://img.shields.io/npm/dm/@harryplusplus/knex-pglite)](https://www.npmjs.com/package/@harryplusplus/knex-pglite)

[PGlite](https://pglite.dev/)를 [Knex.js](https://knexjs.org/)과 함께 사용하기 위한 방언입니다.

## 목차

<!-- toc -->

- [언어](#%EC%96%B8%EC%96%B4)
- [설치](#%EC%84%A4%EC%B9%98)
- [사용법](#%EC%82%AC%EC%9A%A9%EB%B2%95)
  - [쉬운 초기화](#%EC%89%AC%EC%9A%B4-%EC%B4%88%EA%B8%B0%ED%99%94)
  - [PGlite 인스턴스 주입](#pglite-%EC%9D%B8%EC%8A%A4%ED%84%B4%EC%8A%A4-%EC%A3%BC%EC%9E%85)
- [API](#api)
  - [`client`](#client)
  - [`connection`](#connection)
    - [`pglite`](#pglite)
- [라이선스](#%EB%9D%BC%EC%9D%B4%EC%84%A0%EC%8A%A4)

<!-- tocstop -->

## 언어

- [English](/README.md)
- [한국어](/README.ko.md)

## 설치

아래 명령어로 설치합니다.

```sh
# npm 사용 시
npm i knex @electric-sql/pglite @harryplusplus/knex-pglite
# pnpm 사용 시
pnpm add knex @electric-sql/pglite @harryplusplus/knex-pglite
```

> [!WARNING]  
> [Yarn](https://yarnpkg.com/)과 [Bun](https://bun.com/) 환경에서는 아직 테스트되지 않았습니다.

## 사용법

### 쉬운 초기화

Knex 생성 함수의 `client` 및 `connection` 속성을 구성합니다.
`connection` 속성의 값은 PGlite 생성자의 `dataDir` 매개변수로 사용됩니다.

> [!NOTE]  
> PGlite 생성자의 `dataDir`의 자세한 스펙은 [PGlite API `dataDir`](https://pglite.dev/docs/api#datadir) 문서를 확인해주세요.

아래 예제는 쉬운 초기화를 하는 방법입니다.

```typescript
import { PGliteDialect } from "@harryplusplus/knex-pglite";
import Knex from "knex";

const knex = Knex({
  client: PGliteDialect, // Knex PGlite Dialect

  // In-memory 임시 저장소
  connection: {},
  connection: "",
  connection: "memory://",

  // IndexedDB 저장소
  connection: "idb://",

  // 파일 시스템 저장소
  connection: "/my/pglite/data",
});
```

> [!WARNING]  
> `connection` 속성이 없으면 Knex는 **비연결 모드**로 동작합니다.
> 비연결 모드는 SQL 문자열 생성기로 동작하는 것이기 때문에, PGlite를 사용하기 위해서는 반드시 빈 객체라도 값을 정의해야 합니다.

> [!WARNING]  
> File URI (e.g. `file:///my/pglite/data`) 형태의 `connection` 값은 현재 Knex의 연결 문자열 파싱 규칙상 PGlite를 초기화하기 위한 형태로 분석되지 않기 때문에 사용할 수 없습니다.
> File URI가 아닌 파일 경로 (e.g. `/my/pglite/data`) 형태로 입력해주세요.

### PGlite 인스턴스 주입

[쉬운 초기화](#%EC%89%AC%EC%9A%B4-%EC%B4%88%EA%B8%B0%ED%99%94) 방법을 사용할 경우, PGlite 인스턴스는 Knex 인스턴스가 소유한(**owned**) 상태가 됩니다.
다시 말해 PGlite 인스턴스는 Knex 인스턴스와 생명주기를 공유합니다.

In-memory 임시 저장소 방식의 PGlite 인스턴스의 경우, 사용 사례에 따라 Knex 인스턴스와 생명주기를 공유하는 것이 요구사항에 부합하지 않을 수 있습니다.
또한 PGlite 초기화를 위한 다양한 매개변수를 활용할 수 없습니다.

`connection.pglite` 속성을 PGlite 인스턴스를 반환하는 동기 또는 비동기 함수로 구성합니다.
이 경우 Knex 내부에서는 PGlite 인스턴스를 빌린(**borrowed**) 상태로 간주합니다.
다시 말해 Knex는 PGlite 인스턴스의 생명주기를 외부로 위임했기 때문에, PGlite 인스턴스의 생성과 소멸을 관리하지 않습니다.

아래 예제는 PGlite 인스턴스를 주입하는 방법입니다.

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
> `satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig`를 사용하는 이유는 다음과 같습니다.
>
> 1. `satisfies PGliteConnectionConfig`를 사용해 Knex PGlite Dialect에 필요한 `connection` 속성의 타입을 강제합니다.
> 2. `as Knex.Knex.StaticConnectionConfig`를 사용해 Knex 타입 정의에 부합하도록 단언합니다.

## API

Knex 생성 함수의 매개변수 중에서 다음 속성을 구성합니다.

### `client`

`client` 속성에 `PGliteDialect` 클래스를 지정해야 Knex PGlite Dialect를 사용할 수 있습니다.

### `connection`

`connection` 속성의 타입은 다음과 같습니다.

```typescript
export interface PGliteConnectionConfig {
  pglite?: PGliteProvider;
}
```

다음은 `connection`을 구성하기 위한 속성입니다.

#### `pglite`

`pglite` 속성의 타입은 다음과 같습니다.

```typescript
export interface PGliteProvider {
  (): MaybePromise<PGlite>; // (): PGlite | Promise<PGlite>
}
```

> [!NOTE]  
> PGlite의 다양한 기능을 확인하려면 [PGlite API](https://pglite.dev/docs/api) 문서를 읽어주세요.

## 라이선스

MIT
