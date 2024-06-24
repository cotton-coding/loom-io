# Combining Converters

Sometimes files content could be written in different formats like `json` and `yaml`, but the information is the same, so you will note care about the format and just have a json like object. `CombinedConverter`is doing this task for you. Combined with a LoomFile it directly reads the data from the file and convert it to `json`if one of the registered converter can handle the file type.

::: code-group

```sh [npm]
npm add @loom-io/converter
```

```sh [pnpm]
pnpm add @loom-io/converter
```

```sh [bun]
bun add @loom-io/converter
```

:::

## Usage

At least it works still as all other converter, but you need to register other converter to do the convert task.

```ts
import { createCombinedConverter, NoValidFileConverterException  } from '@loom-io/converter';
import { createJsonConverter } from '@loom-io/json-converter';
import { createYamlConverter } from '@loom-io/yaml-converter';
import { MemoryAdapter } from '@loom-io/memory-adapter';

const adapter = new MemoryAdapter();
const converter = createCombinedConverter([createJsonConverter(), createYamlConverter()], {
	failOnNoConverter: true // this is the default value.
})

const file = adapter.file('some/random/file.yaml')

try {
	const json = await converter.parse(file);
	// do some stuff with the data ....
} catch ( error ) {
	if(error instanceOf NoValidFileConverterException){
		console.log('do something');
	}
	throw error;
}
```

## Build a compatible converter

Converters have a very simple base structure, to be compatible they just need to full fill the `FileConverter` interface. Take a look a the code of the [json](https://github.com/cotton-coding/loom-io/blob/main/plugins/json-converter/src/json-converter.ts) or [yaml](https://github.com/cotton-coding/loom-io/blob/main/plugins/yaml-converter/src/yaml-converter.ts) converter to see some easy implementations.
