# loom-io

This repository should include service to handle and work with files. The goal is to handle git and filesystem operations and offer more functionality the nodejs fs functions

## How to

The library offers to read a dir or file from filesystem. File content could be read and converted to json. To support more then .json files it is possible to add plugin. Currently files with extension yml, yaml and json are convert able to json by default.

```ts
import Loom from '@loom-io/fs'

const file = Loom.file('./some/file.json')

// the file could be read as plain txt or json
const str = file.text();
const json = file.json();
const buffer = file.plain();

// If you want to have the directory just call
file.parent // it is the same as for a directory 


// Register a plugin, look below to get more information on plugins
Loom.register(/*some plugin*/)

```

By default the system can read json and yml and convert it to json. To Support more, you can write PlugIns and adapted them.

Reading a dir Works similar.

```ts
import Loom, {type File, type Directory} from '@loom-io/fs'

const root = Loom.root(); // Returns a directory object of the project root, to call the system root call Loom.dir('/)
const dir = Loom.dir('some/dir');

// here you have functions to list the content of the dir and get files
const files  = dir.files(true);  // return all files in the directory and it's subdirectories as type File.

for(let file of files) {
  const json = file.json();
  // do something with the content
}

const list = dir.list() // returns a iterable to get Files and Directories

for(let el of list) {
  if(el instanceOf List) { // check if it is a File
    console.log(el.text()); // do some Stuff with the file content
  } else (el instanceOf Directory) {
    console.log(el.list().length) // in the other case it is an directory and you can go on working with it
  }
}

// to get the parent of a directory
if(dir.parent !== undefined) {
  dir.parent.list()
}

// to select a specific sub directory call
dir.subDir('sub/path'); // this is not validated and only throws an arrow an calling list or files

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



