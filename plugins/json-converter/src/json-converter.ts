import { PLUGIN_TYPE, type LoomFileConverter, LoomFile } from '@loom-io/core';


function verify(file: LoomFile): boolean {
	if (file.extension !== 'json') return false;
	return true;
}

async function stringify<T = unknown>(file: LoomFile, content: T) {
	const contentString = JSON.stringify(content, null, 2);
	await file.write(contentString);
}

async function parse<T = unknown>(file: LoomFile): Promise<T> {
	const content = await file.text();
	return JSON.parse(content);
}

export default () => ({
	$type: PLUGIN_TYPE.FILE_CONVERTER,
	verify,
	parse,
	stringify,
}) satisfies LoomFileConverter;