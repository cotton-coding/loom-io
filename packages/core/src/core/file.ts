import { PLUGIN_TYPE, type LoomFileConverter, FILE_SIZE_UNIT, SourceAdapter } from '../definitions.js';
import { FileConvertException, PluginNotFoundException } from '../exceptions.js';
import { Directory } from './dir.js';
import { join as joinPath, extname, dirname, basename } from 'node:path';
import { Editor } from './editor.js';

export interface PrefixDefinition {
	dept: number,
	separator: string
}

export class LoomFile {

	protected static converterPlugins: Map<string, LoomFileConverter> = new Map();
	protected _extension: string | undefined;

	static from(adapter: SourceAdapter ,dir: Directory, name: string): LoomFile
	static from(adapter: SourceAdapter, path: string): LoomFile
	static from(adapter: SourceAdapter, dirOrPath: Directory | string, name: string = ''){

		if(typeof dirOrPath === 'string') {
			name = basename(dirOrPath);
			dirOrPath = new Directory(adapter, dirname(dirOrPath));
		}

		return new LoomFile(adapter, dirOrPath, name);
	}

	constructor(
		protected _adapter: SourceAdapter,
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

	async getSizeInBytes() {
		const stats = await this._adapter.stat(this.path);
		return stats.size;
	}

	async getSize(unit: FILE_SIZE_UNIT = FILE_SIZE_UNIT.BYTE) {
		const bytes = await this.getSizeInBytes();

		const index = Object.values(FILE_SIZE_UNIT).indexOf(unit);
		return bytes / Math.pow(1024, index);
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

	async exists() {
		const fullPath = joinPath(this.dir.path, this.name);
		return this._adapter.fileExists(fullPath);
	}

	async reader() {
		return await Editor.from(this._adapter, this);
	}

	async plain() {
		return await this._adapter.readFile(this.path);
	}

	async text(encoding: BufferEncoding = 'utf8') {
		return await this._adapter.readFile(this.path, encoding);
	}

	static register(plugin: LoomFileConverter) {
		if(plugin.$type === PLUGIN_TYPE.FILE_CONVERTER) {
			plugin.extensions.forEach(ext => {
				LoomFile.converterPlugins.set(ext, plugin);
			});
		}
	}
}