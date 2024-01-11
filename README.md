# loom-io

This repository should include service to handle and work with files. The goal is to handle git and filesytem operations and offer more functionality the nodejs fs functions

## How to

The libary offers to read a dir or file from filesystem.

```

import Loom from '@loom-io/js'

const file = Loom.file('./some/file.json')

// the file could be read as plain txt or json
const str = file.text();
const json = file.json();

```

By default the system can read json and yml and convert it to json. To Support more, you can write PlugIns and adapted them.

Reading a dir Works simular.

```
import Loom from '@loom-io/fs'

const dir = Loom.dir('some/dir');

// here you have functions to list the content of the dir and get files
const files  = dir.files(true);  // retrun all files in the directory and it's subdirectories as type File.

for(let file of files) {
  const json = file.json();
  // do something with the content
}

dir.list(); // List all folder and files as string in the directory
dir.listFiles() // List all files as string in the direytory 

```

