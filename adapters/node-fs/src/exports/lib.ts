import { PathLike } from 'node:fs';
import { source } from '../core/source';
import { PLUGIN_TYPE, type LoomSourceAdapter } from '@loom-io/core';

export default (key: string = 'file', rootdir: PathLike) => ({
	$type: PLUGIN_TYPE.SOURCE_ADAPTER,
	source: (link: string) => {
		if(link.startsWith(key)) {
			return source(link, rootdir);
		}
	}
}) satisfies LoomSourceAdapter;