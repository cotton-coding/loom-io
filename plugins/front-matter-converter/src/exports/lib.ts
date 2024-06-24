import type { LoomFile } from "@loom-io/core";
import { parse } from "../core/parse.js";
import { unify } from "../core/unify.js";
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
		unify,
	} satisfies FileConverter;
}

export default createFrontMatterConverter;
