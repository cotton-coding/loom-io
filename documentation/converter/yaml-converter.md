---
title: YAML Converter
description: This converter adapter for Loom-IO reads a YAML or YML file and transforms it into JSON, or it can write your JSON data into a YAML or YML file.
---

# YAML Converter

Add this converter to read yaml files as json.

::: code-group

```sh [npm]
npm add @loom-io/yaml-converter
```

```sh [pnpm]
pnpm add @loom-io/yaml-converter
```

```sh [bun]
bun add @loom-io/yaml-converter
```

:::

## Usage

You can read and write yaml files with the suffixes `yaml` adn `yml`.

```ts
import { createYamlConverter } from "@loom-io/yaml-converter";

const yamlFile = adapter.file("some/yaml/file.yaml");
const converter = createJsonConverter();
const data = await converter.parse(yamlFile);
data.val = "test";
await converter.unify(yamlFile, data);
```