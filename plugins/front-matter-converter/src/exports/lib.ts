import type { LoomFile } from "@loom-io/core";
import { parse } from "../core/parse.js";
import { stringify } from "../core/stringify.js";
import { FileConverter } from "@loom-io/converter";
type Config = {
	extensions?: string[];
};

const prepareVerify =
	(config: Config = {}) =>
	(file: LoomFile): boolean => {
		const { extensions = ["md"] } = config;
		for (const extension of extensions) {
			if (file.name.endsWith(extension)) {
				return true;
			}
		}
		return false;
	};

export function createFrontMatterConverter(config?: Config) {
	return {
		verify: prepareVerify(config),
		parse,
		stringify,
	} satisfies FileConverter;
}

export default createFrontMatterConverter;
