import { PLUGIN_TYPE, type LoomFile, type LoomFileConverter } from '@loom-io/core';
import { parse } from '../core/parse.js';
import { stringify } from '../core/stringify.js';
type Config = {
	extensions?: string[];
}

const prepareVerify = (config: Config = {}) => (file: LoomFile): boolean => {
	const { extensions = ['md'] } = config;
	for(const extension of extensions) {
		if(file.name.endsWith(extension)) {
			return true;
		}
	}
	return false;
};

const generateNone = (config: Config = {}) => {
	const configString = JSON.stringify(config);
	return Symbol.for(`front-matter-converter-${configString}`);
};

export default (config?: Config) => ({
	$type: PLUGIN_TYPE.FILE_CONVERTER,
	nonce: generateNone(config),
	verify: prepareVerify(config),
	parse,
	stringify
}) satisfies LoomFileConverter;