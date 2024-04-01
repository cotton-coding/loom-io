---
---

# JSON Converter

Adding this converter to read json-files as json.

::: code-group

```sh [npm]
npm add @loom-io/json-converter
```

```sh [pnpm]
pnpm add @loom-io/json-converter
```

```sh [bun]
bun add @loom-io/json-converter
```

:::

## Usage

Before usage you have to register the json converter

```ts
import Loom from "@loom-io/core";
import jsonConverter from "@loom-io/json-converter";

Loom.register(jsonConverter());
```

The you can read and write json files

```ts
const jsonFile = await Loom.file("memory://some/json/file.json");
const data = await jsonFile.json();
data.val = "test";
jsonFile.stringify(data);
```
