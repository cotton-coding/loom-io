---
title: Front Matter Converter
description: This converter allows you to read files such as markdown files with a front matter part as JSON.
---

# Front Matter Converter

Use this converter to read files with a front matter part as json.

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

When reading, the converter returns a file with the attributes `data` and `content`. The first is the json converted header part. The second is a string containing the content. The content will not be converted by default. By default the converter only reads markdown files (md), but any other file type could be read as well. Setting the option will overwrite the default value.

```ts
import { createFrontMatterConverter } from "@loom-io/front-matter-converter";

// at default it reads markdown files (md)
const matterConverter = createFrontMatterConverter();
// but every other file type could be set as well
const nykMatterConverter = createFrontMatterConverter({
	extensions: ["nyk"]
})

```
If there is no front matter part, `data` will be undefined and if there is no content, `content` will be an empty string. When writing the stringify will analyse the given function and convert it to a file. If the given value has more than just a `data` or `content` key it will only be translated to a header. You can also set only one of the two keys.

```ts
const adapter = new MemoryAdapter();
const mdFile = adapter.file("some/yaml/file.md");
const converter = createFrontMatterConverter();
const fileData = await converter.parse(mdFile);
fileData.data.someValue = "test";
fileData.content = `
#Headline

some random markdown

`;

converter.stringify(mdFile, fileData);

```

Be careful when writing. A `undefined` value for content or data will still overwrite the section!
