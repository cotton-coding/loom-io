import { FileConverter } from "@loom-io/converter";
import { LoomFile } from "@loom-io/core";

function verify(file: LoomFile): boolean {
	if (file.extension === "json") return true;
	return false;
}

async function unify(file: LoomFile, content: unknown) {
	const contentString = JSON.stringify(content);
	await file.write(contentString);
}

async function parse(file: LoomFile): Promise<unknown> {
	const content = await file.text();
	return JSON.parse(content);
}

export function createJsonConverter() {
	return {
		verify,
		parse,
		unify,
	} as FileConverter;
}

export default createJsonConverter;
