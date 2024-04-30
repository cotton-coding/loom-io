import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { PLUGIN_TYPE, type LoomFile, type LoomFileConverter } from '@loom-io/core';

const nonce = Symbol('yaml-converter');

function verify(file: LoomFile): boolean {
	if (file.extension === 'yaml' || file.extension === 'yml') return true;
	return false;
}

async function stringify(file: LoomFile, content: unknown) {
	const contentString = stringifyYaml(content);
	await file.write(contentString);
}

async function parse(file: LoomFile): Promise<unknown> {
	const content = await file.text();
	return parseYaml(content);
}

export default () => ({
	$type: PLUGIN_TYPE.FILE_CONVERTER,
	nonce,
	verify,
	parse,
	stringify
}) satisfies LoomFileConverter;