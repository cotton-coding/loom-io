import { PLUGIN_TYPE, type LoomFileConverter, FILE_SIZE_UNIT, SourceAdapter } from '../definitions.js';
import { FileConvertException } from '../exceptions.js';
import { Directory } from './dir.js';
import { join as joinPath, extname, dirname, basename } from 'node:path';
import { Editor } from './editor.js';

export interface PrefixDefinition {
	dept: number,
	separator: string
}

export class LoomFile {

	protected static converterPlugins: Array<LoomFileConverter> = [];
	protected _extension: string | undefined;
	protected _converter: LoomFileConverter | undefined;

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

	get adapter() {
		return this._adapter;
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

	async json(): Promise<unknown> {
		const converter = await this.getConverterPlugin();

		return converter.parse(this);
	}

	async stringify(content: unknown) {
		const converter = await this.getConverterPlugin();

		converter.stringify(this, content);
	}

	async delete() {
		await this._adapter.deleteFile(this.path);
	}

	async copy(to: Directory) {
		if(this.adapter.isCopyable(to.adapter)) {
			await this._adapter.copyFile(this.path, to.path);
		} else {
			throw new Error('Coping between different adapters is currently not supported');
		}
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

	async write(data: string | Buffer) {
		await this._adapter.writeFile(this.path, data);
	}

	async create() {
		await this._dir.create();
		await this._adapter.writeFile(this.path, Buffer.alloc(0));
	}



	protected async getConverterPlugin(): Promise<LoomFileConverter> {
		if(this._converter !== undefined) {
			return this._converter;
		}

		try {
			const plugin = await Promise.any(LoomFile.converterPlugins.map(async (plugin) => {
				if(await plugin.verify(this)) {
					return Promise.resolve(plugin);
				}
				return Promise.reject();
			}));

			this._converter = plugin;
			return plugin;

		} catch (error) {
			throw new FileConvertException(this.path, 'No converter found for file');
		}

	}

	static register(plugin: LoomFileConverter) {
		if(plugin.$type === PLUGIN_TYPE.FILE_CONVERTER) {
			LoomFile.converterPlugins.push(plugin);
		}
	}

	[Symbol.toPrimitive](): string {
		return this.path;
	}

	get [Symbol.toStringTag]() {
		return 'LoomFile';
	}
}