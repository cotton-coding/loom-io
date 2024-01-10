import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import type { LoomFSFileConverter } from './types.js';
import { FileDoesNotExistException, PluginNotFoundException } from './exceptions.js';

export class File {

	protected static plugins: LoomFSFileConverter[] = [];

	constructor(
        protected path: string
	) {
		if(!existsSync(path)) {
			throw new FileDoesNotExistException(path);
		}
	}

	async json<T>() {
		const text = await this.text();
		for(const plugin of File.plugins) {
			if(plugin.extentions.includes(this.path.split('.').pop()!)) {
				return plugin.parse(text) as T;
			}
		}

		throw new PluginNotFoundException(this.path);
	}

	async text(encoding: BufferEncoding = 'utf8') {
		return fs.readFile(this.path, encoding);
	}

	static register(plugin: LoomFSFileConverter) {
		File.plugins.push(plugin);
	}

	static async fromArray (paths: string[]) {
		return {
			asArray() {
				return paths.map((path) => new File(path));
			},
			[Symbol.iterator]: function* () {
				for(const path of paths) {
					yield new File(path);
				}
			}
		};
	}
    
}