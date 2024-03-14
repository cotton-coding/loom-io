import { Directory, LoomFile } from '@loom-io/core/internal';
import { Adapter } from './adapter';
import * as fs from 'node:fs/promises';
import { dirname, basename } from 'node:path';
import { PathLike } from 'node:fs';

export const source = (async (path: string, rootdir: PathLike) => {
	const adapter = new Adapter(rootdir);
	const stats = await fs.stat(path);
	if(stats.isFile()) {
		const dir = new Directory(adapter, dirname(path));
		return new LoomFile(adapter, dir, basename(path));
	} else {
		return new Directory(adapter, path);
	}
});