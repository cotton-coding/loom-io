import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { type LoomFile } from "@loom-io/core";
import { FileConverter } from "@loom-io/converter";

function verify(file: LoomFile): boolean {
	if (file.extension === "yaml" || file.extension === "yml") return true;
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

export function createYamlConverter() {
	return {
		verify,
		parse,
		stringify,
	} satisfies FileConverter;
}

export default createYamlConverter;
