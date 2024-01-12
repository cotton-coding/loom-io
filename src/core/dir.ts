import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { File } from './file.js';
import { List } from './list.js';



export class Directory {

	constructor(
        protected _path: string
	) {
		fs.access(_path);
	}

	get path() {
		return this._path;
	}

	subdir(subDir: string) {
		return new Directory(path.join(this.path, subDir));
	}

	async list(): Promise<List> {

		const paths =  await fs.readdir(this.path, {withFileTypes: true});

		return new List(this, paths);
	}

	relativePath(dir: Directory): string {
		return path.relative(this.path, dir.path);
	}


	file(name: string): File {
		return new File(path.join(this.path, name));
	}

	protected async filesRecursion(list: List): Promise<List> {

		const dirList = list.filterByDirent('isDirectory');
		const fileList = list.filterByDirent('isFile');

		for(const el of dirList) {
			if(el instanceof Directory) {
				const subList = await el.list();
				fileList.add(await this.filesRecursion(subList));
			}
		}

		return fileList;
	}

	async files(recursive: boolean = false): Promise<List> {
		const list = await this.list();

		if(recursive) {
			return this.filesRecursion(list);
		} else {
			const fileList = list.filterByDirent('isFile');
			return fileList;
		}
  
		
	}
}