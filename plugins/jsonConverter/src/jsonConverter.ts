import { PLUGIN_TYPE, type LoomFileConverter } from '@loom-io/core';

export default {
	$type: PLUGIN_TYPE.FILE_CONVERTER,
	extensions: ['json'],
	parse: JSON.parse,
	stringify: JSON.stringify
} satisfies LoomFileConverter;