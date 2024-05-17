---
---

# In Memory Adapter

This adapter was created mainly for testing purposes, but could also be used as a replacement for any other adapter. As the name suggests, it stores all data in memory, making it probably the fastest adapter.

::: code-group

```sh [npm]
npm add @loom-io/in-memory-adapter
```

```sh [pnpm]
pnpm add @loom-io/in-memory-adapter
```

```sh [bun]
bun add @loom-io/in-memory-adapter
```

:::

## Setup and configuration

There aren't any configuration options, but you can create multiple versions of it just like you can with every other adapter to store different information. It'll be perfect for running tests – just replace it with your other adapter for testing.

```ts
import MemoryAdapter from "@loom-io/in-memory-adapter";

// you can even have multiples
const memory = new MemoryAdapter();
const file = memory.file("/some/file.pdf");
const dir = memory.dir("/some/dir");
```
