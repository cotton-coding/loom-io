---
---

# In Memory Adapter

This adapter was manly created for testing, but could also be used as a replacement for any other adapter. As the name told it stores all data in memory, which make it probably the fastest adapter.

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

## Setup and Config

The adapter only has an default export and export a function to configure the adapter. In this case the only option is to set the key to reference it. As with all other adapters you can register it with different identifiers. The default identifier is `memory://`.

```ts
import Loom from "@loom-io/core";
import memoryAdapter from "@loom-io/in-memory-adapter";

Loom.register(memoryAdapter("my-memory://"));
Loom.register(memoryAdapter());
```
