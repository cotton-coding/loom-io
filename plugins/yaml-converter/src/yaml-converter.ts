import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { PLUGIN_TYPE, type LoomFile, type LoomFileConverter } from '@loom-io/core';

function verify(file: LoomFile): boolean {
	if (file.extension !== 'yaml' && file.extension !== 'yml') return false;
	return true;
}

async function stringify<T = unknown>(file: LoomFile, content: T) {
	const contentString = stringifyYaml(content);
	await file.write(contentString);
}

async function parse<T = unknown>(file: LoomFile): Promise<T> {
	const content = await file.text();
	return parseYaml(content);
}

export default () => ({
	$type: PLUGIN_TYPE.FILE_CONVERTER,
	verify,
	parse,
	stringify
}) satisfies LoomFileConverter;