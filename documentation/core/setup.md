---
title: Setup loom-io
describe: We'll walk you through setting up loom-io so you can get on with your life a bit easier with file storage systems and converting files.
---

# Installation

The software is split into several adapters to connect different file storing systems like S3 or local filesystem. In the adapter section you will find more information to the different adapters, the base construction is every time the same.

Each Adapter has `@loom-io/core` as a peer dependency, so you need also to install this package. The following example shows this for the S3-Adapter

::: code-group

```sh [npm]
npm add @loom-io/minio-s3-adapter @loom-io/core
```

```sh [pnpm]
npm add @loom-io/minio-s3-adapter @loom-io/core
```

```sh [bun]
npm add @loom-io/minio-s3-adapter @loom-io/core
```

:::

If you want to work with another source, check out the adapter section.

To reduce the complexity of the project we externalize the converting of file. So you direkt give the file to one of the converter and parse them. To make it simpler converting different filetype there is a Module to [combine multiples converters](/converter/combined-converter). This allow you for example to convert JSON and YAML files as there is no different.


## Basic Setup (S3) with converting JSON and YAML files

For the setup you need to install multiple modules, this give you the flexibility, to only install what you really need and do not have dependencies to unused libraries.

For the setup you need the following packages

::: code-group

```sh [npm]
npm add @loom-io/core @loom-io/s3-minio-adapter @loom-io/yaml-converter @loom-io/json-converter @loom-io/converter
```

```sh [pnpm]
pnpm add @loom-io/core @loom-io/ns3-minio-adapter @loom-io/yaml-converter @loom-io/json-converter @loom-io/converter
```

```sh [bun]
bun add @loom-io/core @loom-io/s3-minio-adapter @loom-io/yaml-converter @loom-io/json-converter @loom-io/converter
```

:::

Now you can set up an S3 connection. In this example we will use an open minio instance from [minio](https://min.io/) and convert read files

```ts
import S3MinioAdapter from "@loom-io/minio-s3-adapter";
import { createJsonConverter } from "@loom-io/json-converter";
import { createYamlConverter} from "@loom-io/yaml-converter";
import { createCombinedConverter }

const minioConfig = {
	endPoint: "play.min.io",
	port: 9000,
	useSSL: true,
	accessKey: "Q3AM3UQ867SPQQA43P2F",
	secretKey: "zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG",
};

const bucketName = "loom-io-test-bucket";

const s3Source = new S3MinioAdapter(bucketName, minioConfig));

const converter = createCombinedConverter([createJsonConverter(), createYamlConverter()])

const file = s3Source.file('path/on/s3/file.yaml');

const content = converter.parse(file);
```

Now we can dive deeper into loom-io and the storage system to access or create files and directories.
