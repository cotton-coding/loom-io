import { PathLike } from 'node:fs';
import { source } from '../core/source.js';
import { PLUGIN_TYPE, type LoomSourceAdapter, Directory, LoomFile } from '@loom-io/core';

export default (key: string = 'file://', rootdir?: PathLike) => ({
	$type: PLUGIN_TYPE.SOURCE_ADAPTER,
	source: (link: string, Type?: typeof Directory | typeof LoomFile) => {
		if(link.startsWith(key)) {
			const path = link.slice(key.length);
			return source(path, rootdir, Type);
		}
	},
	nonce: Symbol('node-fs-source-adapter')
}) satisfies LoomSourceAdapter;