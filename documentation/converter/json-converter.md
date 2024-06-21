---
title: JSON Converter
description: This converter adapter for Loom-IO reads a JSON file and transforms it into JSON, or it can write your JSON data into a JSON file.
---

# JSON Converter

Add this converter to read json files as json.

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

Under the hood the json converter fits the standard `JSON.parse` and `JSON.stringify` and just reads the data from file as text. So the benefits are mainly existing in combination with the [CombinedConverter](/converter/combined-converter)

```ts
import { createJsonConverter } from "@loom-io/json-converter";

const jsonFile = adapter.file("some/yaml/file.json");
const converter = createJsonConverter();
const data = await converter.parse(jsonFile);
data.val = "test";
await converter.stringify(jsonFile, data);
```
