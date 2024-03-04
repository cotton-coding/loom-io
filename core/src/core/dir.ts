import * as fs from 'node:fs/promises';
import { join as joinPath, relative as relativePath, resolve as resolvePath} from 'node:path';
import { LoomFile } from './file.js';
import { List } from './list.js';
import { isErrnoException } from './helper/typechecks.js';

export class Directory {

	protected readonly _path: string;
	protected _strict: boolean = false;

	constructor(
		path: string = process.cwd(), ...paths: string[]
	) {
		this._path = resolvePath(path, ...(paths || []));
	}

	strict(strictMode: boolean = true) {
		this._strict = strictMode;
		return this;
	}

	get path() {
		return this._path;
	}

	get parent(): Directory | undefined {
		if(this._path === '/') return undefined;
		const split = this.path.slice(1).split('/');
		split.pop();
		return new Directory(`/${split.join('/')}`);
	}

	async exists(): Promise<boolean> {
		try {
			await fs.access(this.path, fs.constants.R_OK);
			return true;
		} catch {
			return false;
		}
	}

	async create(): Promise<void> {
		await fs.mkdir(this.path, {recursive: true});
	}

	async delete(recursive: boolean = false): Promise<void> {
		try {
			await fs.rmdir(this.path, {recursive});
		} catch (err) {
			if(this._strict){
				throw err;
			} 
			if(isErrnoException(err)) {
				if((err as NodeJS.ErrnoException).code !== 'ENOENT' && (err as NodeJS.ErrnoException).errno !== -2) {
					throw err;
				}
			}
		}
	}

	subDir(name: string) {
		return new Directory(joinPath(this.path, name));
	}

	async list(): Promise<List> {

		const paths =  await fs.readdir(this.path, {withFileTypes: true});

		return new List(this, paths);
	}

	/**
	 * Returns the relative path to the given path or undefined if the given dir or file is parent or not related
	 */
	relativePath(dir: Directory | LoomFile): string | undefined {
		const p = relativePath(this.path, dir.path);
		return p === '' ? undefined : p;
	}


	file(name: string): LoomFile {
		return new LoomFile(this, name);
	}

	protected async filesRecursion(list: List): Promise<List<LoomFile>>{

		const dirList = list.only('dirs');
		let fileList = list.only('files');

		for(const el of dirList) {
			const subList = await el.list();
			fileList = fileList.concat(await this.filesRecursion(subList));
		}

		return fileList;
	}

	async files(recursive: boolean = false): Promise<List<LoomFile>> {
		const list = await this.list();

		if(recursive) {
			return this.filesRecursion(list);
		} else {
			const fileList = list.only('files');
			return fileList;
		}
	}
}