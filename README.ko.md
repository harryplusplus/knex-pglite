# Knex.js PGlite Dialect

[Knex.js](https://knexjs.org/)를 위한 [PGlite](https://pglite.dev/) 방언.

## Table of Contents

<!-- toc -->

- [언어](#%EC%96%B8%EC%96%B4)
- [설치](#%EC%84%A4%EC%B9%98)
- [사용법](#%EC%82%AC%EC%9A%A9%EB%B2%95)
  - [기본 메모리 DB로 사용하는 방법](#%EA%B8%B0%EB%B3%B8-%EB%A9%94%EB%AA%A8%EB%A6%AC-db%EB%A1%9C-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95)
  - [PGlite 인스턴스를 주입하는 방법](#pglite-%EC%9D%B8%EC%8A%A4%ED%84%B4%EC%8A%A4%EB%A5%BC-%EC%A3%BC%EC%9E%85%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95)
    - [PGlite 인스턴스를 주입해야 하는 이유](#pglite-%EC%9D%B8%EC%8A%A4%ED%84%B4%EC%8A%A4%EB%A5%BC-%EC%A3%BC%EC%9E%85%ED%95%B4%EC%95%BC-%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0)
    - [여러 유닛 테스트간 격리된 동일 데이터를 사용하는 방법](#%EC%97%AC%EB%9F%AC-%EC%9C%A0%EB%8B%9B-%ED%85%8C%EC%8A%A4%ED%8A%B8%EA%B0%84-%EA%B2%A9%EB%A6%AC%EB%90%9C-%EB%8F%99%EC%9D%BC-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95)
    - [`connection` 속성 객체에 타입 검사 및 타입 단언을 하는 이유](#connection-%EC%86%8D%EC%84%B1-%EA%B0%9D%EC%B2%B4%EC%97%90-%ED%83%80%EC%9E%85-%EA%B2%80%EC%82%AC-%EB%B0%8F-%ED%83%80%EC%9E%85-%EB%8B%A8%EC%96%B8%EC%9D%84-%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0)
    - [덤프 데이터를 로드하는 방법](#%EB%8D%A4%ED%94%84-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%A5%BC-%EB%A1%9C%EB%93%9C%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95)
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

### 기본 메모리 DB로 사용하는 방법

PGlite를 기본 메모리 DB로 사용하기 위해서는 아래 예제처럼 초기화해주세요.

```typescript
import { Client_PGlite } from "@harryplusplus/knex-pglite";
import Knex from "knex";

const knex = Knex({
  client: Client_PGlite, // Knex.js PGlite 방언을 사용하기 위해서 반드시 구성해야 합니다.
  connection: {}, // SQL 생성기가 아닌, PGlite 연결을 위해서 빈 객체로 초기화해야 합니다.
});
```

위 예제처럼 초기화된 PGlite 인스턴스의 생명주기는 Knex.js 인스턴스 내에 생성되기 때문에 Knex.js 인스턴스의 생명주기를 따릅니다.
대부분의 사용사례에서는 이 방법으로 충분할 수 있습니다.

> [!NOTE]
> 위와 같이 `connection` 속성이 빈 객체로 초기화되는 경우, 내부적으로 PGlite의 기본생성자(`new PGlite()`)를 호출합니다.

하지만 특정 사용사례에서는 이 방법이 충분하지 않을 수 있습니다.
다음 절인 [PGlite 인스턴스를 주입하는 방법](#pglite-%EC%9D%B8%EC%8A%A4%ED%84%B4%EC%8A%A4%EB%A5%BC-%EC%A3%BC%EC%9E%85%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95)을 확인해주세요.

### PGlite 인스턴스를 주입하는 방법

#### PGlite 인스턴스를 주입해야 하는 이유

PGlite는 단일 인스턴스 DB입니다.
일반적인 네트워크 또는 파일 시스템을 사용한 클라이언트/서버 구조의 DB와 다릅니다.
[기본 메모리 DB로 사용하는 방법](#%EA%B8%B0%EB%B3%B8-%EB%A9%94%EB%AA%A8%EB%A6%AC-db%EB%A1%9C-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95)처럼 Knex.js 인스턴스 내에서 PGlite 인스턴스를 생성할 경우, 클라이언트/서버 구조적인 관점에서 보면 서버를 클라이언트 내부에 생성하는 것과 같습니다.
실제로 Knex.js 인스턴스 파괴시 PGlite 인스턴스도 파괴됩니다.
메모리 데이터 덤프 및 로드하기, 여러 유닛 테스트간 격리된 동일 데이터 사용하기와 같은 사용사례에서는 PGlite 인스턴스를 Knex.js 인스턴스로 주입하는 것이 유용할 수 있습니다.

#### 여러 유닛 테스트간 격리된 동일 데이터를 사용하는 방법

아래 예제는 여러 유닛 테스트간 격리된 동일 데이터를 사용하는 방법입니다.
PGlite 인스턴스를 테스트 환경 데이터로 초기화한 후 `pglite.clone()` 메서드를 사용해 격리된 환경을 복사합니다.
매번 초기화하는 경우보다 유용할 수 있습니다.

```typescript
import { PGlite } from "@electric-sql/pglite";
import {
  Client_PGlite,
  PGliteConnectionConfig,
} from "@harryplusplus/knex-pglite";
import Knex from "knex";

async function doTestSuite() {
  const pglite = new PGlite();
  // 데이터 구성하기...
  await Promise.all([doUnitTest1(pglite), doUnitTest2(pglite)]);
}

async function doUnitTest1(pglite: PGlite) {
  const knex = Knex({
    client: Client_PGlite,
    connection: {
      pglite: () => pglite.clone(), // 데이터 복사
    } satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig,
  });
  // 테스트하기...
}

async function doUnitTest2(pglite: PGlite) {
  const knex = Knex({
    client: Client_PGlite,
    connection: {
      pglite: () => pglite.clone(), // 데이터 복사
    } satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig,
  });
  // 테스트하기...
}
```

#### `connection` 속성 객체에 타입 검사 및 타입 단언을 하는 이유

`connection` 속성 객체에 `satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig`를 사용하는 이유는 다음과 같습니다.

1. `connection` 속성 객체의 타입을 엄격하게 검사하기 위해서 `satisfies PGliteConnectionConfig`를 사용합니다.
2. Knex.js의 `connection` 객체의 타입으로 맞추기 위해서 `as Knex.Knex.StaticConnectionConfig`를 사용합니다.

#### 덤프 데이터를 로드하는 방법

아래의 예제는 덤프 데이터를 로드하는 방법입니다.

```typescript
import { PGlite } from "@electric-sql/pglite";
import {
  Client_PGlite,
  PGliteConnectionConfig,
} from "@harryplusplus/knex-pglite";
import Knex from "knex";

async function doTest(data: File) {
  const knex = Knex({
    client: Client_PGlite,
    connection: {
      pglite: () =>
        new PGlite({
          loadDataDir: data, // 덤프 데이터 불러오기
        }),
    } satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig,
  });
  // 테스트하기...
}
```

## API

Knex.js의 초기화를 위한 `config` 매개변수 중 다음과 같은 속성을 사용합니다.

### `client`

`client` 속성은 `Client_PGlite` 클래스를 값으로 구성해야 Knex.js PGlite 방언을 사용할 수 있습니다.

예제는 다음과 같습니다.

```typescript
import { Client_PGlite } from "@harryplusplus/knex-pglite";
import Knex from "knex";

const knex = Knex({
  client: Client_PGlite,
  // ...
});
```

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
동기 함수 또는 비동기 함수의 형태로 등록할 수 있습니다.
값이 지정되지 않을 경우, [기본 메모리 DB로 사용하는 방법](#%EA%B8%B0%EB%B3%B8-%EB%A9%94%EB%AA%A8%EB%A6%AC-db%EB%A1%9C-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95) 절에 설명된 것과 같이 기본 메모리 DB로 동작합니다.

```typescript
export interface PGliteProvider {
  (): MaybePromise<PGlite>; // (): PGlite | Promise<PGlite>
}
```

예제는 다음과 같습니다.

```typescript
import { PGlite } from "@electric-sql/pglite";
import {
  Client_PGlite,
  PGliteConnectionConfig,
} from "@harryplusplus/knex-pglite";
import Knex from "knex";

const pglite = new PGlite();
const knex = Knex({
  // 기본 메모리 DB 모드로 구성할 경우
  // connection: {}, // SQL 생성기가 아닌, PGlite 연결을 위해서 빈 객체로 초기화해야 합니다.

  // PGlite 인스턴스를 주입할 경우
  connection: {
    pglite: () => pglite, // PGlite 인스턴스를 주입합니다.
  } satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig,
});
```

> [!NOTE]
> PGlite의 다양한 기능을 확인하려면 [PGlite API](https://pglite.dev/docs/api) 문서를 읽어주세요.

## 라이선스

MIT
