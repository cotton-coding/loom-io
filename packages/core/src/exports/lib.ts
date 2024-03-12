import { Directory } from '../core/dir.js';
import { LoomFile } from '../core/file.js';
import { Editor, Reader } from '../core/editor.js';
import { List } from '../core/list.js';
import { PLUGIN_TYPE, FILE_SIZE_UNIT } from '../definitions.js';
import { LoomPlugin, LoomSourceAdapter } from '../definitions.js';
import crypto from 'node:crypto';

export { PLUGIN_TYPE, FILE_SIZE_UNIT };
export * from '../exceptions.js';
export * from '../definitions.js';
export type { LoomFile, LoomFile as File, Directory, Editor, Reader, List};
export class LoomIO {

	protected static pluginHashes: string[] = [];
	protected static sourceAdapters: LoomSourceAdapter[] = [];

	protected constructor() {}

	static async source(link: string): Promise<Directory> {
		const dir = await Promise.race(this.sourceAdapters.map(adapter => adapter.source(link)));
		if(dir) {
			return dir;
		}
		throw new Error('No source adapter is matching the given link');
	}

	// static root() {
	// 	return new Directory();
	// }

	// static dir(...path: string[]) {
	// 	return new Directory(...path);
	// }

	// static file(path: string) {
	// 	return LoomFile.from(path);
	// }

	static register(plugin: LoomPlugin) {
		const pluginHash = crypto.createHash('sha1').update(JSON.stringify(plugin)).digest('hex');
		if(this.pluginHashes.includes(pluginHash)) {
			return;
		}
		this.pluginHashes.push(pluginHash);
		if(PLUGIN_TYPE.FILE_CONVERTER === plugin.$type) {
			LoomFile.register(plugin);
		} else if(PLUGIN_TYPE.SOURCE_ADAPTER === plugin.$type) {
			this.sourceAdapters.push(plugin);
		}
	}
}

export function isDirectory(obj: unknown): obj is Directory {
	return obj instanceof Directory;
}

export function isFile(obj: unknown): obj is LoomFile {
	return obj instanceof LoomFile;
}

export function isEditor(obj: unknown): obj is Editor {
	return obj instanceof Editor;
}

export function isReader(obj: unknown): obj is Reader {
	return obj instanceof Editor;
}

export function isList(obj: unknown): obj is List {
	return obj instanceof List;
}

export default LoomIO;