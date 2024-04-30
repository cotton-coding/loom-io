import { PLUGIN_TYPE, type LoomFileConverter, LoomFile } from '@loom-io/core';

const nonce = Symbol('json-converter');

function verify(file: LoomFile): boolean {
	if (file.extension === 'json') return true;
	return false;
}

async function stringify(file: LoomFile, content: unknown) {
	const contentString = JSON.stringify(content);
	await file.write(contentString);
}

async function parse(file: LoomFile): Promise<unknown> {
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