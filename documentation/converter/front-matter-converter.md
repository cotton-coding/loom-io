---
title: Front Matter Converter
description: This converter allows you to read files such as markdown files with a front matter part as JSON.
---

# Front Matter Converter

Add this converter to read files with a front matter part as json.

::: code-group

```sh [npm]
npm add @loom-io/front-matter-converter
```

```sh [pnpm]
pnpm add @loom-io/front-matter-converter
```

```sh [bun]
bun add @loom-io/front-matter-converter
```

:::

## Usage

When reading, the converter returns a file with the attributes `data` and `content`. The first is the json converted header part. The second is a string containing the content.

But before using it, you need to register the yaml converter

```ts
import Loom from "@loom-io/core";
import matterConverter from "@loom-io/front-matter-converter";

Loom.register(matterConverter());
// Other file types
Loom.register(matterConverter({ extensions: ["md", "nyk"] }));
```

As seen in the example above, you can specify which file extension it should try to convert. If no value is given, it will only react to markdown files. This will be overwritten by the given value.
If there is no front matter part, `data` will be undefined and if there is no content, `content` will be an empty string. When writing the stringify will analyse the given function and convert it to a file. If the given value has more than just a `data` or `content` key it will only be translated to a header. You can also set only one of the two keys.

```ts
const yamlFile = await Loom.file("memory://some/yaml/file.md");
const fileData = await yamlFile.json();
fileData.data.someValue = "test";
fileData.content = `
#Headline

some random markdown

`;
yamlFile.stringify(data);
```
