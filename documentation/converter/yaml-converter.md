---
---

# YAML Converter

Adding this converter to read yaml-files as json.

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

Before usage you have to register the yaml converter

```ts
import Loom from "@loom-io/core";
import yamlConverter from "@loom-io/yaml-converter";

Loom.register(yamlConverter());
```

The you can read and write yaml files with the ending `yaml` adn `yml`

```ts
const yamlFile = await Loom.file("memory://some/yaml/file.yaml");
const data = await yamlFile.json();
data.val = "test";
yamlFile.stringify(data);
```
