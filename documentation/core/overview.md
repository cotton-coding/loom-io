# Overview

loom-io simplify the access to different storing systems and brings you additional functionality like reading directories recursive, search files, read them line by line or auto convert files to json.

Take at the specific chapter to get all details of functionality, at least how to build an own plugin. This chapter should just give you an overview for orientation.

## Basic Setup

The default export of loom-io is a global Object you can import at server side without register a plugin or adapter again and again. We will import it as `Loom`, but you can give it any name.

If you are not using a base bundle you need to register an adapter and probably some converters to read files as json. To keep the examples more generic we will import `Loom` from the core library. If you are using a bundle replace the import `@loom-io/core` with the bundle name e.g. `@loom-io/base-fs`.

```ts
import Loom from "@loom-io/core";
import s3MinioAdapter from "@loom-io/minio-s3-adapter";
import JSONConverter from "@loom-io/json-converter";

Loom.register(
	s3MinioAdapter("s3://", {
		bucketName: "test",
		endPoint: "play.min.io",
		port: 9000,
		useSSL: true,
		accessKey: "key",
		secretKey: "secure",
	})
);

Loom.register(JSONConverter);
```

Now we can dive deeper into loom-io and the storing system to access or create files and directories.

## Basic examples

Here are some basic examples to get a impression of the library usage

### List all files in a directory

This is one of the first functions implemented in the library and one of the main reason. We already registered an adapter above so it will be not necessary to have a second one, but to have a full example we will do it anyways. To get all details about the adapter or dir take a look to the doc sections

```ts
import Loom, { isFile, isDirectory } from "@loom-io/core";
import fsAdapter from "@loom-io/node-filesystem-adapter";

// We add the adapter for filesystem now.
// By default the root of our filesystem is your project directory
Loom.register(fsAdapter("file://"));

// the directory do not have to exist
//select the root dir, in this case the project dir
const dir = await Loom.dir("file://");
//read dir recursive and search for files
const files = await dir.files(true);

for (let file of files) {
	console.log(file.path);
}
```
