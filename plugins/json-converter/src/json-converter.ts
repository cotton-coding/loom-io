import { PLUGIN_TYPE, type LoomFileConverter, LoomFile } from '@loom-io/core';

const nonce = Symbol('json-converter');

function verify(file: LoomFile): boolean {
	if (file.extension === 'json') return true;
	return false;
}

async function stringify<T = unknown>(file: LoomFile, content: T) {
	const contentString = JSON.stringify(content);
	await file.write(contentString);
}

async function parse<T = unknown>(file: LoomFile): Promise<T> {
	const content = await file.text();
	return JSON.parse(content);
}

export default () => ({
	$type: PLUGIN_TYPE.FILE_CONVERTER,
	nonce,
	verify,
	parse,
	stringify,
}) satisfies LoomFileConverter;