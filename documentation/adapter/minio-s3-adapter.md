---
---

# S3 Adapter

Connects your S3 as it is a file system storage and based on the minio library. Even if it is based on the minio library you can use it with all other S3 storage e.g: Digital Ocean Spaces, Amazon S3

::: code-group

```sh [npm]
npm add @loom-io/minio-s3-adapter @loom-io/core
```

```sh [pnpm]
pnpm add @loom-io/minio-s3-adapter @loom-io/core
```

```sh [bun]
bun add @loom-io/minio-s3-adapter @loom-io/core
```

:::

## Setup and configuration

Basically the configuration is the same as for [minio](https://min.io/docs/minio/linux/developers/javascript/API.html). You just have to set up a bucket name in advance.

```ts
import S3Adapter from "@loom-io/s3-minio-adapter";

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

const minio = new S3Adapter("my-bucket", s3ConfigMinio);
const ocean = new MinioAdapter("other-bucket", s3ConfigDigitalOcean);
const file = minio.file("/some/file.pdf");
const dir = ocean.dir("/some/dir");
```
