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

## List all files in a directory recursively

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

## Read file content as json

It could be annoying to think about the file format all the time when reading. At developing you are only interest is to handle the data as JSON, not if it is original a YAML, CSV, JSON or what else. loom-io will handle this for you if you have registered a file converter for it. So you just need to register a converter for any possible file type and you just can read a JSON.

```ts
import Loom from '@loom-io/core';
import jsonConverter from '@loom-io/json-converter';
import yamlConverter from '@loom-io/yaml-converter':

const filePaths = ['file://test.yml', 'file://test.json'];

for(let filePath of filePaths) {
  const file = await Loom.file(filePath);
  console.log(file.json());
}

```

## Read file content

Beside JSON any file you be read as Buffer or String

```ts
import Loom from "@loom-io/core";

const file = await Loom.file("file://some/random/file.txt");

const text = await file.text(); // default is utf-8
const ascii = await file.text("ascii");

const buffer = await file.plain();
```

## Get file size

The file size could be read in bytes or directly calculated to YodaBytes

```ts
import Loom, { FILE_SIZE_UNIT } from "@loom-io/core";
import filesystemAdapter from "@loom-io/node-filesystem-adapter";

Loom.register(filesystemAdapter("root://", "/"));

const file = await Loom.file("root://var/log/system.log");

const sizeInByte = file.getSize();
const sizeInMegaByte = file.getSize(FILE_SIZE_UNIT.MEGABYTE);
// or just with size as string
const sizeInKiloByte = file.getSize("KB");
```

## Read files in a directory and filter them

```ts
import Loom from "@loom-io/core";

const projectRoot = await Loom.dir("file://");
const unitTestFiles = (await projectRoot.files(true)).filter((el) =>
	el.name.endsWith(".spec.ts")
);

const contentOfProjectRoot = await projectRoot.list();
const directoriesInProjectRoot = contentOfProjectRoot.only("dirs");
```

## Concat two list and iterate over them

```ts
import Loom, (isDirectory, isFile) from "@loom-io/core";

const projectRoot = await Loom.dir("file://");

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

Instead of iterating over a list you can also get it as a Array.

```ts
import Loom, (isDirectory, isFile) from "@loom-io/core";
const projectRoot = await Loom.dir("file://");
const srcDirContent = await projectRoot.subDir("src").list();

const contentOfSrcDirAsArray = srcDirContent.asArray();
```

## Read a large file line by line

To avoid loading large files into heap, you can use a reader which give you the possibility to read a file line by line or even search (next example). You can step forward `next()` or backwards `prev()` to each line. To save time and not reanalyze a given line the start and end position is stored. This also means you will currently not able to do this use full on changing files.

```ts
import Loom from "loom-io/fs";

const file = Loom.file("file://some/large/readable.log");
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

## Search text in large a file

Search a file for a given text from the beginning `search()`or `searchFirst()`or search a file for a given text from the end `searchLast()`. You can also use a buffer to search the text, but there is currently no regex support, because it will be hard to match the fragment size and overlapping of fragments to match probably. As with read line by line you can also step forward `next()`and backwards `prev()`. Also in this case the start and end position is stored for faster results.

```ts
import Loom from "loom-io/fs";

const file = Loom.file("file://other/large/readable.md");
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
