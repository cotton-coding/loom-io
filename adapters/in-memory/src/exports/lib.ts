import { source } from '../core/source.js';
import { PLUGIN_TYPE, type LoomSourceAdapter, Directory, LoomFile } from '@loom-io/core';

export default (key: string = 'memory://') => ({
	$type: PLUGIN_TYPE.SOURCE_ADAPTER,
	source: (link: string, Type?: typeof Directory | typeof LoomFile) => {
		if(link.startsWith(key)) {
			const path = link.slice(key.length);
			return source(path, Type);
		}
	},
	nonce: Symbol('in-memory-source-adapter')
}) satisfies LoomSourceAdapter;