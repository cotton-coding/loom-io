import { Directory } from '../core/dir.js';
import { LoomFile } from '../core/file.js';
import { Editor, Reader } from '../core/editor.js';
import { List } from '../core/list.js';
import { PLUGIN_TYPE, FILE_SIZE_UNIT } from '../definitions.js';
import { LoomPlugin, LoomSourceAdapter } from '../definitions.js';
import crypto from 'node:crypto';
import { NoSourceAdapterException } from '../exceptions.js';

export { PLUGIN_TYPE, FILE_SIZE_UNIT };
export * from '../exceptions.js';
export * from '../definitions.js';
export type { LoomFile, LoomFile as File, Directory, Editor, Reader, List};
export class LoomIO {

	protected static pluginHashes: string[] = [];
	protected static sourceAdapters: LoomSourceAdapter[] = [];

	protected constructor() {}

	static async source(link: string): Promise<Directory | LoomFile>
	static async source(link: string, Type: typeof Directory): Promise<Directory>
	static async source(link: string, Type: typeof LoomFile): Promise<LoomFile>
	static async source(link: string, Type?: typeof Directory | typeof LoomFile): Promise<Directory | LoomFile> {
		try {
			const dirOrFile = await Promise.any(this.sourceAdapters.map(adapter => adapter.source(link, Type)));
			if(dirOrFile) {
				return dirOrFile;
			}
		} catch(e) {
			console.warn('Probably no source adapter registered');
			console.warn(e);
		}

		throw new NoSourceAdapterException(link);
	}

	static dir(link: string) {
		return LoomIO.source(link, Directory);
	}

	static file(path: string) {
		return LoomIO.source(path, LoomFile);
	}

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