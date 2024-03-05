import { Dirent } from 'fs';
import { Directory } from '../core/dir.js';
import { join } from 'path';	

export class DirentWrapper {

	constructor(
		protected _dir: Directory,  
		protected _dirent: Dirent) {
	}

	isDirectory() {
		return this.dirent.isDirectory();
	}

	isFile() {
		return this.dirent.isFile();
	}

	get dirent() {
		return this._dirent;
	}

	get dir() {
		return this._dir;
	}

	get name() {
		return this.dirent.name;
	}

	get parentPath() {
		return this.dir.path;
	}

	get path() {
		return join(this.dir.path, this.name);
	}

}