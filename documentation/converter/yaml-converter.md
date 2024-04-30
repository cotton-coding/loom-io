---
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

Before using, you need to register the yaml converter

```ts
import Loom from "@loom-io/core";
import yamlConverter from "@loom-io/yaml-converter";

Loom.register(yamlConverter());
```

You can read and write yaml files with the suffixes `yaml` adn `yml`

```ts
const yamlFile = await Loom.file("memory://some/yaml/file.yaml");
const data = await yamlFile.json();
data.val = "test";
yamlFile.stringify(data);
```
