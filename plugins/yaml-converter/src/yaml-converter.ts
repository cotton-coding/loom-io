import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { type LoomFile } from "@loom-io/core";
import { FileConverter } from "@loom-io/converter";

function verify(file: LoomFile): boolean {
	if (file.extension === "yaml" || file.extension === "yml") return true;
	return false;
}

async function unify<T>(file: LoomFile, content: T) {
	const contentString = stringifyYaml(content);
	await file.write(contentString);
}

async function parse<T>(file: LoomFile): Promise<T> {
	const content = await file.text();
	return parseYaml(content) as T;
}

export function createYamlConverter<T = unknown>() {
	return {
		verify,
		parse: parse<T>,
		unify: unify<T>,
	} satisfies FileConverter<T>;
}

export default createYamlConverter;
