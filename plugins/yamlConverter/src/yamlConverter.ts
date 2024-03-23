import { parse, stringify } from 'yaml';
import { PLUGIN_TYPE, type LoomPlugin } from '@loom-io/core';

export default {
	$type: PLUGIN_TYPE.FILE_CONVERTER,
	extensions: ['yml', 'yaml'],
	parse,
	stringify
} satisfies LoomPlugin;