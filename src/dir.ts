import fs from 'node:fs/promises';
import type { Dirent } from 'node:fs';
import path from 'node:path';
import { File } from './file.js';

type PickMatching<T, V> =
    { [K in keyof T as T[K] extends V ? K : never]: T[K] }
type DirentMethodsName = keyof PickMatching<Dirent, () => unknown>;
type ReturnTypeTuble<T extends Array<DirentMethodsName>> = {
    [K in keyof T]: ReturnType<Dirent[T[K]]>
}

export class Directory {
	constructor(
        protected path: string
	) {
		fs.access(path);
	}

	async list(subDir?: string): Promise<string[]>
	async list<T extends DirentMethodsName[], U = [string, ...ReturnTypeTuble<T>][]>(subDir?: string, ...params: T): Promise<U>
	async list<T extends DirentMethodsName[], U = [string, ...ReturnTypeTuble<T>][]>(subDir?: string, ...params: T): Promise<U | string[]> {
		if(params.length === 0) {
			const dirs =  await fs.readdir(path.join(this.path, subDir ?? ''));
			return dirs;
		}

		const dirs =  await fs.readdir(path.join(this.path, subDir ?? ''), {withFileTypes: true});

		return dirs.map((dir) => {
			const p = params.map((param) => {
				return dir[param]();
			});
			return [dir.name, ...p];
		}) as U;
      
	}


	async listFiles(subDir?: string, recursive: boolean = false): Promise<string[]> {
		const pathContent = await this.list(subDir, 'isDirectory');

       
		return await pathContent.reduce<Promise<string[]>>(
			async (acc, [name, isDirecotry]) => {
				const data = await acc;
				if (recursive && isDirecotry) {
					const p = path.join(subDir ?? '', name);
					const list = await this.listFiles(p, recursive);
					const subDirFiles = list.map((subName) => path.join(p, subName));
					return data.concat(subDirFiles);
				} else if (!isDirecotry) {
					data.push(name);
					return data;
				}

				return data;
			}, Promise.resolve(Array<string>())
		);


	}

	async files(recursive: boolean = false) {
		const paths = await this.listFiles('', recursive);
		return paths.map((file) => new File(path.join(this.path, file)));
	}
}