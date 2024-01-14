import { PLUGIN_TYPE, type LoomFSFileConverter } from '../core/types.js';

export default {
	type: PLUGIN_TYPE.FILE_CONVERTER,
	extentions: ['json'],
	parse: JSON.parse,
	stringify: JSON.stringify
} satisfies LoomFSFileConverter;