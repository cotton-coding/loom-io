# Installation

The Software is split in multiple adapter, that do a part of the work and give you the flexible. To start easily we would recomb to start with a pre configured bundle.

## Install bundle

Currently there is only one bundle to work with the filesystem, at least also this bundle could be extended by other adapters and plugins and over the same functionality as the core package.

::: code-group

```sh [npm]
npm add @loom-io/base-fs
```

```sh [pnpm]
pnpm add @loom-io/base-fs
```

```sh [bun]
bun add @loom-io/base-fs
```

:::

## Install without bundle

If you try to avoid unused dependencies it is recommended to the modules yourself, but also if the base bundles offer you not enough functionality.

The heart connecting everything and implemented the used syntax is the core package.

::: code-group

```sh [npm]
npm add @loom-io/core
```

```sh [pnpm]
pnpm add @loom-io/core
```

```sh [bun]
bun add @loom-io/core
```

:::

This package will not work out of the box, because it is missing an adapter to connect files. For example to get a similar functionality as in the filesystem bundle you need to install the filesystem adapter and some converter to convert different filetypes to json.

::: code-group

```sh [npm]
npm add @loom-io/core @loom-io/node-filesystem-adapter @loom-io/yaml-converter @loom-io/json-converter
```

```sh [pnpm]
pnpm add @loom-io/core @loom-io/node-filesystem-adapter @loom-io/yaml-converter @loom-io/json-converter
```

```sh [bun]
bun add @loom-io/core @loom-io/node-filesystem-adapter @loom-io/yaml-converter @loom-io/json-converter
```

:::

You will find installation package in the adapter and converter descriptions.
