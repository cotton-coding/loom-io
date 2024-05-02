---
title: Setup loom-io
describe: We'll walk you through setting up loom-io so you can get on with your life a bit easier with file storage systems and converting files.
---

# Installation

The software is split into several adapters that do some of the work and give you flexibility. To get started easily, we would recombine to start with a pre-configured bundle.

## Installing a bundle

Currently there is only one bundle to work with the filesystem, at least this bundle could be extended by other adapters and plugins and have the same functionality as the core package.

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

## Installing without a bundle

If you are trying to avoid unused dependencies, it is recommended to install the modules yourself, but also if the base bundles do not offer you enough functionality.

The core package is the heart that holds everything together and implements the syntax used.

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

This package will not work out of the box because it lacks an adapter to connect to a storage system, e.g. S3, Filesystem . For example, to get similar functionality as in the filesystem bundle, you need to install the filesystem adapter and some converters to convert different file types to json.

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

You can find the installation package in the adapter and converter descriptions.

## Basic Setup (S3)

The default export of loom-io is a global object that you can import on the server side without having to register a plugin or adapter over and over again. We will import it as `Loom`, but you can give it any name you like.

If you are not using a base bundle, you will need to register an adapter and probably some converters to read files as json.
To keep the examples more generic, we will import `Loom` from the core library. If you are using a bundle replace the import `@loom-io/core` with the bundle name e.g. `@loom-io/base-fs`.

For the setup you need the following packages

::: code-group

```sh [npm]
npm add @loom-io/core @loom-io/s3-minio-adapter @loom-io/yaml-converter @loom-io/json-converter
```

```sh [pnpm]
pnpm add @loom-io/core @loom-io/ns3-minio-adapter @loom-io/yaml-converter @loom-io/json-converter
```

```sh [bun]
bun add @loom-io/core @loom-io/s3-minio-adapter @loom-io/yaml-converter @loom-io/json-converter
```

:::

Now you can set up an S3 connection. In this example we will use an open minio instance from [minio](https://min.io/)

```ts
import Loom from "@loom-io/core";
import s3MinioAdapter from "@loom-io/minio-s3-adapter";
import jsonConverter from "@loom-io/json-converter";
import yamlConverter from "@loom-io/yaml-converter";

const minioConfig = {
	endPoint: "play.min.io",
	port: 9000,
	useSSL: true,
	accessKey: "Q3AM3UQ867SPQQA43P2F",
	secretKey: "zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG",
};

const bucketName = "loom-io-test-bucket";

Loom.register(s3MinioAdapter("s3://", bucketName, minioConfig));

Loom.register(jsonConverter());
Loom.register(yamlConverter());
```

Now we can dive deeper into loom-io and the storage system to access or create files and directories.
