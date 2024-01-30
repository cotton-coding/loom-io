import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { PLUGIN_TYPE, type LoomFSFileConverter } from './types.js';
import { FileConvertException, PluginNotFoundException } from './exceptions.js';
import { Directory } from './dir.js';
import { join as joinPath, extname, dirname, basename } from 'node:path';
import { Editor } from './editor.js';

export interface PrefixDefinition {
	dept: number,
	separator: string
}

export class LoomFile {

	protected static converterPlugins: Map<string, LoomFSFileConverter> = new Map();
	protected _extension: string | undefined;

	static from(dir: Directory, name: string): LoomFile
	static from(path: string): LoomFile
	static from(dirOrPath: Directory | string, name: string = ''){
		
		if(typeof dirOrPath === 'string') {
			name = basename(dirOrPath);
			dirOrPath = new Directory(dirname(dirOrPath));
		}

		return new LoomFile(dirOrPath, name);
	}

	static async exists(path: string): Promise<boolean>
	static async exists(dir: Directory, name: string): Promise<boolean>
	static async exists(dirOrPath: Directory | string, name: string = ''){
		const path = 
			typeof dirOrPath === 'string'
				? dirOrPath 
				: joinPath((dirOrPath as Directory).path, name);
	
		return new Promise((resolve) => {
			const exists = existsSync(path);
			resolve(exists);
		});
	}

	constructor(
		protected _dir: Directory,
    protected _name: string
	) {}

	get path(): string {
		return joinPath(this.dir.path, this.name);
	}

	get name(): string {
		return this._name;
	}

	get extension() {
		if(this._extension === undefined) {
			const ext = extname(this.name);
			this._extension = ext === '' ? undefined: ext.slice(1);
		}
		return this._extension;
	}

	get dir(): Directory {
		return this._dir;
	}

	get parent() {
		return this.dir;
	}

	async json<T>() {
		if(this.extension === undefined) {
			throw new FileConvertException(this.path, 'File has no extension');
		}
	
		const plugin = LoomFile.converterPlugins.get(this.extension);

		if(plugin === undefined) {
			throw new PluginNotFoundException(this.path);
		}

		const text = await this.text();
		return plugin.parse<T>(text);
		
	}

	async reader() {
		return await Editor.from(this);
	}

	async plain() {
		return await fs.readFile(this.path);
	}

	async text(encoding: BufferEncoding = 'utf8') {
		return await fs.readFile(this.path, encoding);
	}

	static register(plugin: LoomFSFileConverter) {
		if(plugin.type === PLUGIN_TYPE.FILE_CONVERTER) {
			plugin.extensions.forEach(ext => {
				LoomFile.converterPlugins.set(ext, plugin);
			});
		}
	}
}