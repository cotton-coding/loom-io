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

This package will not work out of the box, because it is missing an adapter to connect a storage system e.g. S3, Filesystem . For example to get a similar functionality as in the filesystem bundle you need to install the filesystem adapter and some converter to convert different filetypes to json.

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

## Basic Setup (S3)

The default export of loom-io is a global Object you can import at server side without register a plugin or adapter again and again. We will import it as `Loom`, but you can give it any name.

If you are not using a base bundle you need to register an adapter and probably some converters to read files as json.
To keep the examples more generic we will import `Loom` from the core library. If you are using a bundle replace the import `@loom-io/core` with the bundle name e.g. `@loom-io/base-fs`.

For the setup you need the following packages:

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

Now you can setup a S3 connection. In this example we will use a open minio instance from [minio](https://min.io/)

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

Loom.register(jsonConverter);
Loom.register(yamlConverter);
```

Now we can dive deeper into loom-io and the storing system to access or create files and directories.
