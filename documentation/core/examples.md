---
title: Work with loom-io
description: Loom-io is a great way to get access to your files and work with them more efficiently. Check out some of the ways you can use it in this article to see how it can help you.
---

# Examples

loom-io simplifies the access to different storage systems and brings you additional functionality like reading directories recursively, searching files, reading them line by line or automatically converting files to json.

Have a look at the specific reference to get all the details of the functionality. This chapter describes the API by use cases, but does not show the full functionality.

## Configure

As show in the chapter before, do not forget to setup and config loom-io before usage.

```ts
import Loom from "@loom-io/core";
import fsAdapter from "@loom-io/node-filesystem-adapter";

// Now we add the filesystem adapter.
// By default the root of our filesystem is your project directory
Loom.register(fsAdapter("file://"));
```

The following examples will not show registering an adapter every time, as you will probably only need to do this once.

## Creating a directory and a file

Creating a directory or file object does not mean that the directory or file actually exists. This means that you could create a virtual object first and then create the real object in the storage system.

```ts
import FsAdapter from "@loom-io/node-filesystem-adapter";

const dir = new FsAdapter().dir("/welcome");
const file = dir.file("hello-world.md");
// so far everything is virtual and does not need to exit to your file system;

console.log(await file.exists()); // Will be false;
console.log(await dir.exists()); // Will be false;

// create an empty file welcome/hello-world.md
await file.create();

console.log(await dir.exists()); // Will be true;
console.log(await file.exists()); // Will be false;
```

When the file was created, the directory was also created directly. To avoid this and create the directory automatically, use `file.write`.

## List all files in a directory recursively

This is one of the first functions implemented in the library, and one of the main reasons why. We have already registered one adapter above, so it will not be necessary to have a second one, but to have a complete example we will do it anyway. To get all the details about the adapter or dir, take a look at the doc sections

```ts
import FsAdapter from "@loom-io/node-filesystem-adapter";

const adapter = new FsAdapter();

// the directory do not have to exist
//select the root dir, in this case the project dir
const dir = await adapter.dir("/");
//read dir recursive and search for files
const files = await dir.files(true);

for (let file of files) {
	console.log(file.path);
}
```

## List content of a Directory

```ts
import { isFile, isDirectory } from "@loom-io/core";
import MemoryAdapter from "@loom-io/in-memory-adapter"

const adapter = new MemoryAdapter();
const dir = adapter.dir('');
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

## Read file content as json

It can be annoying to think about the file format all the time when reading. When developing you are only interested in handling the data as JSON, not if it is originally a YAML, CSV, JSON or what else. loom-io will do this for you if you have registered a file converter for it. So you just have to register a converter for every possible file type and you can just read a JSON.

```ts
import MemoryAdapter from "@loom-io/in-memory-adapter"
import jsonConverter from '@loom-io/json-converter';
import yamlConverter from '@loom-io/yaml-converter':

Loom.register(jsonConverter());
Loom.register(yamlConverter());

const adapter = new MemoryAdapter()

const filePaths = ['file://test.yml', 'file://test.json'];

for(let filePath of filePaths) {
  const file = adapter.file(filePath);
  console.log(await file.json());
}

```

## Read file content

In addition to JSON, you can read any file as a buffer or string.

```ts
const file = await adapter.file("file://some/random/file.txt");

const text = await file.text(); // default is utf-8
const ascii = await file.text("ascii");

const buffer = await file.plain();
```

## Get file size

The file size can be read in bytes or calculated directly in YodaBytes

```ts
import { FILE_SIZE_UNIT } from "@loom-io/core";
import FilesystemAdapter from "@loom-io/node-filesystem-adapter";

const adapter = new FilesystemAdapter("/");

const file = adapter.file("/var/log/system.log");

const sizeInByte = file.getSize();
const sizeInMegaByte = file.getSize(FILE_SIZE_UNIT.MEGABYTE);
// or just with size as string
const sizeInKiloByte = file.getSize("KB");
```

## Read files in a directory and filter them

```ts
const projectRoot = await adapter.dir("/");
const unitTestFiles = (await projectRoot.files(true)).filter((el) =>
	el.name.endsWith(".spec.ts")
);

const contentOfProjectRoot = await projectRoot.list();
const directoriesInProjectRoot = contentOfProjectRoot.only("dirs");
```

## Concatenate two lists and iterate over them

```ts
import (isDirectory, isFile) from "@loom-io/core";

const projectRoot = await adapter.dir("/");

const srcDirContent = await projectRoot.subDir("src").list();
const testDirContent = await projectRoot.subDir("test").list();

const srcAndTestDirContent = srcDirContent.concat(testDirContent);

for(let element of srcAndTestDirContent) {
  if(isDirectory(element)) {
    // do some stuff with directory
  }

  if(isFile(element)) {
    // do some stuff with file
  }
}
```

## Get directory list as array

Instead of iterating over a list you can also get it as an Array.

```ts
import { isDirectory, isFile } from "@loom-io/core";
const projectRoot = adapter.dir("/");
const srcDirContent = await projectRoot.subDir("src").list();

const contentOfSrcDirAsArray = srcDirContent.asArray();
```

## Reading a large file line by line

To avoid loading large files into the heap, you can use a reader which allows you to read or even search a file line by line (next example). You can go forward `next()` or backward `prev()` to each line. To save time and not have to re-analyse a given line, the start and end positions are stored. This also means that you will not be able to use this feature fully on modified files at the moment.

```ts
const file = adapter.file("/some/large/readable.log");
const reader = await file.reader();

const lineResult = await reader.firstLine();
// start at the end of a file with reader.lastLine()

do {
	const line = await lineResult.read();
	//do something with the line
} while (await lineResult.next());
// You can step back and forward with prev() and next()

// Do not forget to close the reader
await reader.close();
```

## Searching for text in a large file

Search a file for a given text from the beginning `search()` or `searchFirst()` or search a file for a given text from the end `searchLast()`. You can also use a buffer to search the text, but there is currently no regex support because it will be hard to match the fragment size and overlap of fragments. As with reading line by line, you can also step forward `next()` and backward `prev()`. Again, the start and end positions are saved for faster results.

```ts
const file = adapter.file("/other/large/readable.md");
const reader = await file.reader();

const result = await reader.searchLast("a better world");

if (result !== undefined) {
	do {
		const { start, end } = result.meta;
		//do something with meta data e.g. read the result + one symbol before and after
		const length = end - start;
		const data = await reader.read(start - 1, length + 1);
	} while (await result.prev());
}

// Do not forget to close the reader
await reader.close();
```
