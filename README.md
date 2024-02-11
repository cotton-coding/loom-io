# loom-io

[![codecov](https://codecov.io/gh/cotton-coding/loom/graph/badge.svg?token=HA5N9V34OE)](https://codecov.io/gh/cotton-coding/loom)

Currently this library helps to read files and directories. There is also planned to offer functions to edit and load sources like git

## How to

The library offers to read a dir or file from filesystem. File content could be read and converted to json. To support more then .json files it is possible to add plugin. Currently files with extension yml, yaml and json are convert able to json by default.

```ts
import Loom from '@loom-io/fs'

const file = Loom.file('./some/file.json')

// the file could be read as plain txt or json
const str = await file.text();
const json = await file.json();
const buffer = await file.plain();

// get file size
const size = await file.getSize('MB') // B KB MB GB TB ... YB

// read line by line or search in large files without loading the file into heap memory (see below for more details)
const reader = await file.reader();
const { start, end } = (await reader.search('cotton-coding')).meta;
await reader.close();

// If you want to have the directory just call
file.parent // it is the same as for a directory 


// Register a plugin, look below to get more information on plugins
Loom.register(/*some plugin*/)

```

By default the system can read json and yml and convert it to json. To Support more, you can write PlugIns and adapted them.

Reading a dir Works similar.

```ts
import Loom, {type LoomFile, type Directory} from '@loom-io/fs'

const root = Loom.root(); // Returns a directory object of the project root, to call the system root call Loom.dir('/)
const dir = Loom.dir('some/dir');

// here you have functions to list the content of the dir and get files
const files  = await dir.files(true);  // return all files in the directory and it's subdirectories as type File.

for(let file of files) {
  const json = file.json();
  // do something with the content
}

const list = await dir.list() // returns a iterable to get Files and Directories

for(let el of list) {
  if(el instanceOf LoomFile) { // check if it is a File
    console.log(await el.text()); // do some Stuff with the file content
  } else (el instanceOf Directory) {
    console.log((await el.list()).length) // in the other case it is an directory and you can go on working with it
  }
}

// to get the parent of a directory
if(dir.parent !== undefined) {
  await dir.parent.list()
}

// to select a specific sub directory call
dir.subDir('sub/path'); // this is not validated and only throws an arrow an calling list or files

```

## Lists

A list Object is returned if you call `list` or `files` of the directory object. The list Object gives you the ability to iterate offer the results, get them as an Array or filter them.

```ts
const arrayOfFilesAndDirectories = dir.list().asArray();

//Ready type save filter
const listOfFiles = (await dir.list()).only('files');
const listOfDirs = (await dir.list()).only('dirs');

//own filter for more advanced. The callback function gets an DirentWrapper Object which have some readonly attributes, you can get also the dirent or the dir.
(await dir.list()).filter<LoomFile>((el) => el.name.endsWith('.spec.yml'));
(await dir.list()).filter<Directory>((el) => el.isDirectory());

// see more examples for iteration above
for(let file of await dir.files()) {
  const json = file.json();
  // do something with the content
}

```


## Reader

The reader makes it possible to search or read lines in files without loading them completely. It is your decision if you do this from the top or the end of a file.

```ts
import Loom from 'loom-io/fs';

const file = Loom.file('some/file/readable.md');
const reader = await file.reader();

const result = await reader.searchLast('a better world');

if( result !== undefined ) {
  do {
    const { start, end } = result.meta;
    //do something with meta data e.g. read the result + one symbol before and after
    const length = end - start;
    const data = await reader.read(start - 1, length + 1)
  } while ( await result.prev() )
}


const lineResult = await reader.firstLine();

do {
  const line = await lineResult.read();
  //do something with the line
} while ( await lineResult.next() ) 

// Do not forget to close the reader
await reader.close();

```



## Plugins

To handle and covert more file types to json loom-io/fs allow to register plugins. Currently there is only support for one type of Plugin

```ts
// Plugin type to convert file content to json
export type LoomFSFileConverter = {
  type: PLUGIN_TYPE.FILE_CONVERTER,
  extensions: string[],
  parse<T = unknown>(content: string): T
  stringify<T = unknown>(content: T): string
}
```

Currently there are two plugins already included, to convert yml and json files to json.

```ts
import { PLUGIN_TYPE, type LoomFSFileConverter } from 'loom-io/fs';


//example for the plugin to convert json strings.
export default {
	type: PLUGIN_TYPE.FILE_CONVERTER,
	extensions: ['json'],
	parse: JSON.parse,
	stringify: JSON.stringify
} satisfies LoomFSFileConverter;
```

Plugins could be registered with `Loom.register`

```ts
import Loom from 'loom-io/fs';
import mdPlugin from './link/to/plugin';

Loom.register(mdPlugin);

```



