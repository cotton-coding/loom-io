import type { LoomFile } from "@loom-io/core";
import { parse } from "../core/parse.js";
import { unify } from "../core/unify.js";
import { FileConverter } from "@loom-io/converter";
import { DataFormat } from "../core/utils.js";
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

export function createFrontMatterConverter<T = unknown>(config?: Config) {
	return {
		verify: prepareVerify(config),
		parse: parse<T>,
		unify: unify<T>,
	} satisfies FileConverter<DataFormat<T>, Partial<DataFormat<T>>>;
}

export default createFrontMatterConverter;
