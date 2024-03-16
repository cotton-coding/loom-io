import { Directory, LoomFile } from '@loom-io/core/internal';
import { Adapter } from './adapter';
import { dirname, basename } from 'node:path';
import { splitTailingPath } from '../utils/path';

export const source = async (path: string,  Type?: typeof Directory | typeof LoomFile) => {
	const adapter = new Adapter();
	if(Type === LoomFile) {
		const dir = new Directory(adapter, dirname(path));
		return new LoomFile(adapter, dir, basename(path));
	} else if(Type === Directory || path.endsWith('/')) {
		return new Directory(adapter, path);
	} else {
		if(await adapter.fileExists(path)) {
			const [subPath, tail] = splitTailingPath(path);
			const dir = new Directory(adapter, subPath || '/');
			return new LoomFile(adapter, dir, tail);
		} else {
			return new Directory(adapter, path);
		}
	}
};