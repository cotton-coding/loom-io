# loom-io/base-fs

This is a good place to start with @loom-io and a local filesystem. This Bundle includes:

- @loom-io/core
- @loom-io/node-filesystem-adapter
- @loom-io/yaml-converter
- @loom-io/json-converter

## Just start

You can easily replace this with a non bundle version and to registration of adapter and converter yourself, this bundle just help you to concentrate on your filesystem and not on how to add and configure plugins.
The root of the bundle is every time your project root. To change de scope go along without the bundle.

```ts
import Loom from "@loom-io/base-fs";

const dir = await Loom.dir("file://welcome");
const file = dir.file("hello-world.md");
// till here everything is virtual and do not have to exit on your filesystem;

console.log(await file.exists()); // Will be false;
console.log(await dir.exists()); // Will be false;

// create an empty file welcome/hello-world.md
await file.create();

console.log(await dir.exists()); // Will be true;
console.log(await file.exists()); // Will be false;
```

## Documentation of loom-io

loom-io will help you reading files of any size from different source more easily. See [documentation](https://loom-io.cotton-coding.com) for more details.
