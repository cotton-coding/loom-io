import { PathLike } from 'node:fs';
import { type LoomSourceAdapter } from '@loom-io/core';
import { Adapter } from '../core/adapter.js';
import { dirname, basename } from 'node:path';
import { Directory, LoomFile } from '@loom-io/core/internal';

export class FilesystemAdapter implements LoomSourceAdapter {
	protected adapter: Adapter;
	constructor(rootdir: PathLike = process.cwd()) {
		this.adapter = new Adapter(rootdir);
	}
	file(path: string): LoomFile {
		const dir = new Directory(this.adapter, dirname(path));
		return new LoomFile(this.adapter, dir, basename(path));
	}
	dir(path: string): Directory {
		return new Directory(this.adapter, path);
	}
}