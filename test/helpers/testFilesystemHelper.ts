import { faker } from '@faker-js/faker';
import fs from 'node:fs/promises';
import { join as joinPath, dirname} from 'node:path';

export type TestFilesystemHelperFileOptions= {
    path?: string,
    mimeType?: string,
    extention?: string,
}

export type TestFilesystemHelperDirOptions = {
    path?: string,
}

const getRandomPath = () => {
	return faker.system.directoryPath().slice(1);
};

export class TestFilesystemHelper {

	private constructor(
        private basePath: string
	) {

	}

	async createFile(content: string = faker.lorem.paragraph(), option: TestFilesystemHelperFileOptions = {}) {
		const mimeType =  option.mimeType ?? 'text/plain';
		const exctention = option.extention ?? faker.system.fileExt(mimeType);
		const path = option.path ?? joinPath(getRandomPath(), `${faker.system.fileName()}.${exctention}`);
		const fullPath = joinPath(this.basePath, path);
		await fs.mkdir(dirname(fullPath), {recursive: true});

		await fs.writeFile(fullPath, Buffer.from(content));
		return new FileObject(this.basePath, path, content);
	}

	async createDir(path: string = getRandomPath()) {
		await fs.mkdir(joinPath(this.basePath, path), {recursive: true});
		return new PathObject(this.basePath, [path]);
	}

	async createDirs(amount: number = faker.number.int({min: 1, max: 13})) {
		const emptyArray = Array(amount).fill(null);
		const paths = await Promise.all(emptyArray.map(async () => {
			const path = getRandomPath();
			await fs.mkdir(joinPath(this.basePath, path), {recursive: true});
			return path;
		}));
		return new PathObject(this.basePath, paths);
	}

	createSubDir(path: string = getRandomPath()) {
		return new TestFilesystemHelper(joinPath(this.basePath, path));
	}

	getBasePath() {
		return this.basePath;
	}

	destroy() {
		fs.rm(this.basePath, {recursive: true});
	}

	static async init() {
		const id = faker.string.uuid();
		const basePath = joinPath(process.cwd(), './test/tmp', id);
		fs.mkdir(basePath, {recursive: true});
		return new TestFilesystemHelper(basePath);
	}
}

export class FileObject {

	private _includeBasePath = false;
    
	constructor(
            private basePath: string,
            private path: string,
            private content: string
	) {}

	includeBasePath(setTo: boolean = true) {
		this._includeBasePath = setTo;
		return this;
	}
    
	getPath() {
		return this._includeBasePath ? joinPath(this.basePath, this.path) : this.path;
	}
    
	getContent() {
		return this.content;
	}
    
}

export class PathObject {

	private _includeBasePath = false;

	constructor(
        private basePath: string,
        private paths: string[]
	) {}

	includeBasePath(setTo: boolean = true) {
		this._includeBasePath = setTo;
		return this;
	}

	getPath(dept: number = 0) {
		if(dept == 0) {
			return this._includeBasePath ? joinPath(this.basePath, this.paths[0]) : this.paths[0];
		} else {
			const parts = this.paths[0].split('/');
			return parts.slice(0, dept).join('/');
		}
	}

	getPaths(dept: number = 0) {
		let paths = this.paths;
		if(dept != 0) {
			paths = paths.map((path) => {
				const parts = path.split('/');
				return parts.slice(0, dept).join('/');
			});
		}
		
		if(this._includeBasePath) {
			return paths.map((path) => joinPath(this.basePath, path));
		}
		return paths;
	}
    
	[Symbol.iterator]() {
		let index = 0;
		const paths = this.paths;
		const basePath = this.basePath;
		const includeBasePath = this._includeBasePath;
		return {
			next() {
				const path = paths[index];
				index++;
				return {
					value: includeBasePath ? joinPath(basePath, path) : path,
					done: index === paths.length
				};
			}
		};
	}

}