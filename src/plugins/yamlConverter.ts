import { parse, stringify } from 'yaml';
import { PLUGIN_TYPE, type LoomFSPlugin } from '../core/types.js';

export default {
	type: PLUGIN_TYPE.FILE_CONVERTER,
	extentions: ['yml', 'yaml'],
	parse,
	stringify
} satisfies LoomFSPlugin;