import { Directory } from './src/dir';
import { File } from './src/file';
import type { LoomFSPlugin } from './src/types';
import crypto from 'node:crypto';

import jsonConverter from './src/plugins/jsonConverter';
import yamlConverter from './src/plugins/yamlConverter';

export type { LoomFSPlugin };
export type { File, Directory };
export class LoomFs {

	protected static pluginHashes: string[] = [];

	protected constructor() {}

	static dir(path: string) {
		return new Directory(path);
	}

	static file(path: string) {
		return new File(path);
	}

	static register(plugin: LoomFSPlugin) {
		const pluginHash = crypto.createHash('sha1').update(JSON.stringify(plugin)).digest('hex');
		if(this.pluginHashes.includes(pluginHash)) {
			return;
		}
		this.pluginHashes.push(pluginHash);
		if(['jsonConverter'].includes(plugin.type)) {
			File.register(plugin);
		}
	}
}

export default LoomFs;

LoomFs.register(jsonConverter);
LoomFs.register(yamlConverter);