# Examples

loom-io simplify the access to different storing systems and brings you additional functionality like reading directories recursive, search files, read them line by line or auto convert files to json.

Take a look at the specific reference to get all details of functionality. This chapter will describe the api by use cases, but will not show the full functionality.

## Configure

As show in the chapter before, do not forget to setup and config loom-io before usage

```ts
import Loom from "@loom-io/core";
import fsAdapter from "@loom-io/node-filesystem-adapter";

// We add the adapter for filesystem now.
// By default the root of our filesystem is your project directory
Loom.register(fsAdapter("file://"));
```

The following examples will not show a registration of a adapter every time, because you will probably do this only once.

## Create a directory and a file

Creating a directory or file object do not mean the directory or file does exists. This means you could firstly create a virtual object and than create the real object in the storage system

```ts
import Loom from "@loom-io/core";

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

While creating the file the directory was directly created too. To avoid and automatic creation of the directory use `file.write`

## List all files in a directory

This is one of the first functions implemented in the library and one of the main reason. We already registered an adapter above so it will be not necessary to have a second one, but to have a full example we will do it anyways. To get all details about the adapter or dir take a look to the doc sections

```ts
import Loom from "@loom-io/core";

// the directory do not have to exist
//select the root dir, in this case the project dir
const dir = await Loom.dir("file://");
//read dir recursive and search for files
const files = await dir.files(true);

for (let file of files) {
	console.log(file.path);
}
```

## List content of a Directory

```ts
import Loom, { isFile, isDirectory } from "@loom-io/core";

const dir = await Loom.dir("file://");
const list = await dir.list() // returns a iterable to get Files and Directories

for(let el of list) {
  if( isFile(el) ) { // check if it is a File
    console.log(await el.text()); // do some Stuff with the file content
  } else ( isDirectory(el) ) { // just to show, it could only be a file or directory
    console.log((await el.list()).length)
  }
}

// to get the parent of a directory
if(dir.parent !== undefined) {
  await dir.parent.list()
}

```
