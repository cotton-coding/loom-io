---
---

# Filesystem Adapter

Access Files from you local filesystem. Don't be confused from the node in the package name, it should also work with bun, because it is node compatible, but there are plans to do a more Bun specific adapter. For now you should also use this for bun, because all adapter exchange able you can easily switch later to the Bun specific adapter if you want to.

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

## Setup and config

The default key for this adapter is `file://`, by default the adapter sets your project directory as root directory (manly the directory you starts you server from), but you can set any other directory. This directory looks like and is accessed like you root directory, so you will not be able to break out of this directory.

```ts
import Loom from "@loom-io/core";
import filesystemAdapter from "@loom-io/node-filesystem-adapter";

// sets key to root:// and the root path to you filesystem root, be careful
Loom.register(filesystemAdapter("root://", "/"));
// use default config. Key is file:// and the "root"-Directory is your project root
Loom.register(filesystemAdapter());
```
