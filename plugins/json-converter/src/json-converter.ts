import { FileConverter } from "@loom-io/converter";
import { LoomFile } from "@loom-io/core";

function verify(file: LoomFile): boolean {
	if (file.extension === "json") return true;
	return false;
}

async function unify<T>(file: LoomFile, content: T) {
	const contentString = JSON.stringify(content);
	await file.write(contentString);
}

async function parse<T>(file: LoomFile): Promise<T> {
	const content = await file.text();
	return JSON.parse(content) as T;
}

export function createJsonConverter<T = unknown>() {
	return {
		verify,
		parse: parse<T>,
		unify: unify<T>,
	} as FileConverter<T>;
}

export default createJsonConverter;
