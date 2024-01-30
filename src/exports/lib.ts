import { Directory } from '../core/dir.js';
import { LoomFile } from '../core/file.js';
import { PLUGIN_TYPE, type LoomFSPlugin } from '../core/types.js';
import crypto from 'node:crypto';

import jsonConverter from '../plugins/jsonConverter.js';
import yamlConverter from '../plugins/yamlConverter.js';

export type { LoomFSPlugin, PLUGIN_TYPE };
export type { LoomFile as File, Directory };
export class LoomFs {

	protected static pluginHashes: string[] = [];

	protected constructor() {}

	static root() {
		return new Directory();
	}

	static dir(path: string) {
		return new Directory(path);
	}

	static file(path: string) {
		return LoomFile.from(path);
	}

	static register(plugin: LoomFSPlugin) {
		const pluginHash = crypto.createHash('sha1').update(JSON.stringify(plugin)).digest('hex');
		if(this.pluginHashes.includes(pluginHash)) {
			return;
		}
		this.pluginHashes.push(pluginHash);
		if(PLUGIN_TYPE.FILE_CONVERTER === plugin.type) {
			LoomFile.register(plugin);
		}
	}
}

export default LoomFs;

LoomFs.register(jsonConverter);
LoomFs.register(yamlConverter);