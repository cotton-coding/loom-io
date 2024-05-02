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

Before using it you need to register the json converter

```ts
import Loom from "@loom-io/core";
import jsonConverter from "@loom-io/json-converter";

Loom.register(jsonConverter());
```

This allows you to read and write json files

```ts
const jsonFile = await Loom.file("memory://some/json/file.json");
const data = await jsonFile.json();
data.val = "test";
jsonFile.stringify(data);
```
