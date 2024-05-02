import { Directory, LoomFile } from '@loom-io/core/internal';
import { Adapter } from './adapter.js';
import * as fs from 'node:fs/promises';
import { dirname, basename } from 'node:path';
import { PathLike } from 'node:fs';

export const source = async (path: string, rootdir?: PathLike, Type?: typeof Directory | typeof LoomFile) => {
	const adapter = new Adapter(rootdir);
	if(Type === LoomFile) {
		const dir = new Directory(adapter, dirname(path));
		return new LoomFile(adapter, dir, basename(path));
	} else if(Type === Directory || path.endsWith('/')) {
		return new Directory(adapter, path);
	} else {
		try {
			const stats = await fs.stat(path);

			if(stats.isFile()) {
				const dir = new Directory(adapter, dirname(path));
				return new LoomFile(adapter, dir, basename(path));
			} else {
				return new Directory(adapter, path);
			}
		} catch {
			return new Directory(adapter, path);
		}
	}
};