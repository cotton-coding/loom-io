import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { PLUGIN_TYPE, type LoomFSFileConverter } from './types.js';
import { FileConvertException, FileDoesNotExistException, PluginNotFoundException } from './exceptions.js';

export class File {

	protected static converterPlugins: Map<string, LoomFSFileConverter> = new Map();
	protected _extention: string | undefined;

	constructor(
        protected _path: string
	) {
		if(!existsSync(_path)) {
			throw new FileDoesNotExistException(_path);
		}
	}

	get path() {
		return this._path;
	}

	get name(): string {
		return <string>this.path.split('/').pop();
	}

	get extention() {
		if(this._extention === undefined) {
			const split = this.name.split('.');
			this._extention = split.length > 1 ? split.pop() : undefined;
		}
		return this._extention;
	}

	async json<T>() {
		const text = await this.text();
		
		if(this.extention === undefined) {
			throw new FileConvertException(this.path, 'File has no extension');
		}
	
		const plugin = File.converterPlugins.get(this.extention);

		if(plugin === undefined) {
			throw new PluginNotFoundException(this.path);
		}

		return plugin.parse<T>(text);
		
	}

	async plain() {
		return await fs.readFile(this.path);
	}

	async text(encoding: BufferEncoding = 'utf8') {
		return await fs.readFile(this.path, encoding);
	}

	static register(plugin: LoomFSFileConverter) {
		if(plugin.type === PLUGIN_TYPE.FILE_CONVERTER) {
			plugin.extentions.forEach(ext => {
				File.converterPlugins.set(ext, plugin);
			});
		}
	}
    
}