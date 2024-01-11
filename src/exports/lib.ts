import { Directory } from '../core/dir.js';
import { File } from '../core/file.js';
import type { LoomFSPlugin } from '../core/types.js';
import crypto from 'node:crypto';

import jsonConverter from '../plugins/jsonConverter.js';
import yamlConverter from '../plugins/yamlConverter.js';

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