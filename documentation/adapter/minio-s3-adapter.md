---
---

# S3 Adapter

Connects your S3 as it is a filesystem storage and based on the minio library. Even if it based on the minio library you can use it with all other S3 Storage e.g.: Digital Ocean Spaces, Amazon S3

::: code-group

```sh [npm]
npm add @loom-io/minio-s3-adapter
```

```sh [pnpm]
pnpm add @loom-io/minio-s3-adapter
```

```sh [bun]
bun add @loom-io/minio-s3-adapter
```

:::

## Setup and config

Mainly the configuration is the same as with [minio](https://min.io/docs/minio/linux/developers/javascript/API.html). You just have setup a bucket name in advance. The default key to identify is `s3://`

```ts
import Loom from "@loom-io/core";
import s3Adapter from "@loom-io/s3-minio-adapter";

const s3ConfigMinio = {
	endPoint: "play.min.io",
	port: 9000,
	useSSL: true,
	accessKey: "Q3AM3UQ867SPQQA43P2F",
	secretKey: "zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG",
};

const s3ConfigDigitalOcean = {
	endpoint: "ams3.digitaloceanspaces.com",
	accessKey: "key",
	secretKey: "secret",
};

// Set own key, bucket name and config for minio
Loom.register(memoryAdapter("my-s3://", "my-bucket", s3ConfigMinio));
// set default key (s3://), bucket name and digital ocean space config
Loom.register(memoryAdapter(undefined, "other-bucket", s3ConfigDigitalOcean));
```
