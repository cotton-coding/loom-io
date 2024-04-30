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

The default key for this adapter is `file://`, by default the adapter sets your project directory as the root directory (manly the directory you start you server from), but you can set any other directory. This directory looks and is accessed like your root directory, so you will not be able to break out of it.

```ts
import Loom from "@loom-io/core";
import filesystemAdapter from "@loom-io/node-filesystem-adapter";

// sets key to root:// and the root path to you filesystem root, be careful
Loom.register(filesystemAdapter("root://", "/"));
// use default config. Key is file:// and the "root"-Directory is your project root
Loom.register(filesystemAdapter());
```
