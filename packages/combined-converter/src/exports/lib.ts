import {
	CombinedConverter,
	CombinedConverterOptions,
} from "../core/CombinedConverter.js";
import { FileConverter } from "../core/definitions.js";

export { CombinedConverter, CombinedConverterOptions, type FileConverter };
export { FileConverterException } from "../core/exceptions.js";

export function createCombinedConverter(
	converter: FileConverter | FileConverter[],
	options: CombinedConverterOptions = {}
) {
	return new CombinedConverter(converter, options);
}
