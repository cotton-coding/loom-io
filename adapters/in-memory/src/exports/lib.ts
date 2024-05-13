import { Directory, LoomFile } from '@loom-io/core/internal';
import { Adapter } from '../core/adapter.js';
import { dirname, basename } from 'node:path';
import { LoomSourceAdapter } from '@loom-io/core';


export class MemoryAdapter implements LoomSourceAdapter {
	protected adapter: Adapter;
	constructor() {
		this.adapter = new Adapter();
	}
	async file(path: string): Promise<LoomFile> {
		const dir = new Directory(this.adapter, dirname(path));
		return new LoomFile(this.adapter, dir, basename(path));
	}
	async dir(path: string): Promise<Directory> {
		return new Directory(this.adapter, path);
	}
}