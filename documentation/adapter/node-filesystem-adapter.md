---
---

# File System Adapter

Access files from your local filesystem. Don't be confused by the node in the package name, it should also work with bun as it is node compatible, but there are plans to make a more bun specific adapter. For now, you should use this for bun as well, as all adapters are interchangeable, you can easily switch to the bun specific adapter later if you want to.

::: code-group

```sh [npm]
npm add @loom-io/node-filesystem-adapter
```

```sh [pnpm]
pnpm add @loom-io/node-filesystem-adapter
```

```sh [bun]
bun add @loom-io/node-filesystem-adapter
```

:::

## Setup and configuration

As a parameter, you can set the context where the adapter should interact. By default, this is the project directory. You can't go any lower than that.

```ts
import FilesystemAdapter from "@loom-io/node-filesystem-adapter";

const root = new FilesystemAdapter("/");
const project = new FilesystemAdapter();
const rootDir = root.dir("/");
const projectDir = project("/");
```
