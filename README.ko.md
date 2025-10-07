# Knex.js PGlite Dialect

[Knex.js](https://knexjs.org/)를 위한 [PGlite](https://pglite.dev/) 방언.

## 목차

<!-- toc -->

- [언어](#%EC%96%B8%EC%96%B4)
- [설치](#%EC%84%A4%EC%B9%98)
- [사용법](#%EC%82%AC%EC%9A%A9%EB%B2%95)
  - [기본 메모리 모드](#%EA%B8%B0%EB%B3%B8-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EB%AA%A8%EB%93%9C)
  - [PGlite 인스턴스 주입 방법](#pglite-%EC%9D%B8%EC%8A%A4%ED%84%B4%EC%8A%A4-%EC%A3%BC%EC%9E%85-%EB%B0%A9%EB%B2%95)
    - [PGlite 인스턴스를 주입해야 하는 이유](#pglite-%EC%9D%B8%EC%8A%A4%ED%84%B4%EC%8A%A4%EB%A5%BC-%EC%A3%BC%EC%9E%85%ED%95%B4%EC%95%BC-%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0)
    - [여러 유닛 테스트 간 격리된 동일 데이터를 사용하는 방법](#%EC%97%AC%EB%9F%AC-%EC%9C%A0%EB%8B%9B-%ED%85%8C%EC%8A%A4%ED%8A%B8-%EA%B0%84-%EA%B2%A9%EB%A6%AC%EB%90%9C-%EB%8F%99%EC%9D%BC-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95)
    - [`connection` 속성에 `satisfies`와 `as`을 사용하는 이유](#connection-%EC%86%8D%EC%84%B1%EC%97%90-satisfies%EC%99%80-as%EC%9D%84-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0)
    - [덤프 데이터를 불러오는 방법](#%EB%8D%A4%ED%94%84-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%A5%BC-%EB%B6%88%EB%9F%AC%EC%98%A4%EB%8A%94-%EB%B0%A9%EB%B2%95)
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

### 기본 메모리 모드

PGlite를 기본 메모리 모드로 사용하려면 아래 예제처럼 초기화하세요.

```typescript
import { PGliteDialect } from "@harryplusplus/knex-pglite";
import Knex from "knex";

const knex = Knex({
  client: PGliteDialect, // Knex PGlite 방언을 사용하려면 반드시 설정해야 합니다.
  connection: {}, // SQL 생성용이 아닌, PGlite 연결을 위해 최소 빈 객체로 초기화해야 합니다.
});
```

위 예제처럼 초기화된 PGlite 인스턴스는 Knex 인스턴스 내에서 생성되므로 Knex 인스턴스의 생명주기를 공유합니다.
대부분의 사용 사례에서는 이 방법으로 충분할 수 있습니다.

> [!NOTE]
> `connection` 속성이 빈 객체로 초기화되면, 내부적으로 PGlite의 기본 생성자(`new PGlite()`)를 호출합니다.

하지만 특정 사용 사례에서는 이 방법이 충분하지 않을 수 있습니다.
다음 절인 [PGlite 인스턴스 주입 방법](#pglite-%EC%9D%B8%EC%8A%A4%ED%84%B4%EC%8A%A4-%EC%A3%BC%EC%9E%85-%EB%B0%A9%EB%B2%95)을 참고하세요.

### PGlite 인스턴스 주입 방법

#### PGlite 인스턴스를 주입해야 하는 이유

PGlite는 단일 인스턴스 기반 데이터베이스입니다.
일반적인 네트워크나 파일 시스템 기반 클라이언트/서버 구조 데이터베이스와 다릅니다.
[기본 메모리 모드](#%EA%B8%B0%EB%B3%B8-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EB%AA%A8%EB%93%9C)에서 설명한 것처럼 Knex 인스턴스 내부에서 PGlite 인스턴스를 생성하면, 마치 클라이언트 내부에 서버를 생성하는 것과 같습니다.
실제로 Knex 인스턴스가 해제되면 PGlite 인스턴스도 함께 해제됩니다.
메모리 데이터의 덤프 및 로드, 여러 유닛 테스트 간 동일한 데이터의 격리 사용 등과 같은 경우 PGlite 인스턴스를 Knex 인스턴스에 주입하는 것이 유용할 수 있습니다.

#### 여러 유닛 테스트 간 격리된 동일 데이터를 사용하는 방법

아래 예제는 여러 유닛 테스트 간에 격리된 동일 데이터를 사용하는 방법입니다.
PGlite 인스턴스를 테스트 환경 데이터로 초기화한 뒤, `pglite.clone()` 메서드로 격리된 환경을 복제합니다.
매번 새로 초기화하는 것보다 효율적일 수 있습니다.

```typescript
import { PGlite } from "@electric-sql/pglite";
import {
  PGliteDialect,
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
    client: PGliteDialect,
    connection: {
      pglite: () => pglite.clone(), // 데이터 복사
    } satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig,
  });
  // 테스트 코드 실행...
}

async function doUnitTest2(pglite: PGlite) {
  const knex = Knex({
    client: PGliteDialect,
    connection: {
      pglite: () => pglite.clone(), // 데이터 복사
    } satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig,
  });
  // 테스트 코드 실행...
}
```

#### `connection` 속성에 `satisfies`와 `as`을 사용하는 이유

`connection` 속성에 `satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig`를 사용하는 이유는 다음과 같습니다.

1. `connection` 객체의 타입을 엄격히 검사하기 위해 `satisfies PGliteConnectionConfig`를 사용합니다.
2. Knex의 `connection` 타입 정의와 일치시키기 위해 `as Knex.Knex.StaticConnectionConfig`를 사용합니다.

#### 덤프 데이터를 불러오는 방법

아래 예제는 덤프 데이터를 불러오는 방법입니다.

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
          loadDataDir: data, // 덤프 데이터 불러오기
        }),
    } satisfies PGliteConnectionConfig as Knex.Knex.StaticConnectionConfig,
  });
  // 테스트 코드 실행...
}
```

## API

Knex를 초기화할 때 `config` 매개변수에서 다음 속성을 설정합니다.

### `client`

`client` 속성에 `PGliteDialect` 클래스를 지정해야 Knex PGlite 방언을 사용할 수 있습니다.

예제는 다음과 같습니다.

```typescript
import { PGliteDialect } from "@harryplusplus/knex-pglite";
import Knex from "knex";

const knex = Knex({
  client: PGliteDialect,
  // ...
});
```

### `connection`

`connection` 속성 타입은 다음과 같습니다.

```typescript
export interface PGliteConnectionConfig {
  pglite?: PGliteProvider;
}
```

다음은 `connection`을 구성하기 위한 속성입니다.

#### `pglite`

`pglite` 속성 타입은 다음과 같습니다.
동기 혹은 비동기 함수 형태로 등록할 수 있습니다.
값이 지정되지 않으면 [기본 메모리 모드](#%EA%B8%B0%EB%B3%B8-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EB%AA%A8%EB%93%9C) 절에서 설명한 대로 기본 메모리 모드로 동작합니다.

```typescript
export interface PGliteProvider {
  (): MaybePromise<PGlite>; // (): PGlite | Promise<PGlite>
}
```

예제는 다음과 같습니다.

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
  // 기본 메모리 모드로 구성할 경우
  // connection: {}, // SQL 생성용이 아닌, PGlite 연결을 위해 최소 빈 객체로 초기화해야 합니다.

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
