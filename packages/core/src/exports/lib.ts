import { Directory } from '../core/dir.js';
import { LoomFile } from '../core/file.js';
import { PLUGIN_TYPE, type LoomPlugin, type LoomFileConverter } from '../core/types.js';
import crypto from 'node:crypto';

export type { LoomPlugin, LoomFileConverter };
export { PLUGIN_TYPE };
export type { LoomFile as File, Directory };
export class LoomIO {

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

	static register(plugin: LoomPlugin) {
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

export default LoomIO;