import type { Dirent } from 'fs';
import { Directory } from './dir.js';
import { DirentWrapper } from './wrapper/dirent.js';
import type { File } from './file.js';


export type ListTypes = File | Directory;

type PickMatching<T, V> =
    { [K in keyof T as T[K] extends V ? K : never]: T[K] }
type DirentMethodsName = keyof PickMatching<DirentWrapper, () => unknown>;
// type ReturnTypeTuble<T extends Array<keyof DirentWrapper>> = {
//     [K in keyof T]: DirentWrapper[T[K]] extends () => unknown ? ReturnType<DirentWrapper[T[K]]> : DirentWrapper[T[K]]
// }

export class List<T extends ListTypes = ListTypes> {

	protected dirWrap: DirentWrapper[];

	static from<T extends ListTypes>(list: List<T>): List<T>
	static from<T extends ListTypes>(direntWraps: DirentWrapper[]): List<T>
	static from<T extends ListTypes>(listOrWrap: List<T> | DirentWrapper[]) {
		const list = new List<T>();
		list.add(listOrWrap);
		return list;
	}

	constructor()
	constructor(dir: Directory, paths: Dirent[])
	constructor(
		dir?: Directory,
		_paths?: Dirent[])
	{
		this.dirWrap = [];
		if(dir && _paths) {
			this.add(dir, _paths);
		}
	}

	protected add(paths: DirentWrapper[]): void
	protected add(dir: Directory, paths: Dirent[]): void
	protected add(list: List<T>): void
	protected add(listOrWrap: List<T> | DirentWrapper[]): void
	protected add(dirOrListOrDirentWrapper: Directory | DirentWrapper[] | List<T>, paths?: Dirent[]) {

		if(dirOrListOrDirentWrapper instanceof Directory) {
			if(paths === undefined) {
				throw new Error('List constructor requires paths argument if the first argument is a Directory');
			}
			const wrapped = paths.map((path) => new DirentWrapper(dirOrListOrDirentWrapper, path));
			this.dirWrap.push(...wrapped);
		} else if(dirOrListOrDirentWrapper instanceof List) {
			this.dirWrap.push(...dirOrListOrDirentWrapper.dirWrap);
		} else {
			this.dirWrap.push(...dirOrListOrDirentWrapper);
		}
	}

	concat<U extends ListTypes>(...lists: Array<List<U>>): List<T | U> {
		const newList = List.from<T | U>(this);
		for(const list of lists) {
			newList.add(list.dirWrap);
		}

		return newList;
	}

	get length() {
		return this.dirWrap.length;
	}

	protected convert(wrap: DirentWrapper) {
		if(wrap.isDirectory()) {
			return wrap.dir.subDir(wrap.name);
		} else {
			return wrap.dir.file(wrap.name);
		}
	}

	at(index: number) {
		const wrap = this.dirWrap[index];
		return this.convert(wrap);
	}

	first<T = Directory | File>(): T {
		return this.at(0) as T;
	}

	last<T = Directory | File>(): T {
		return this.at(this.length - 1) as T;
	}

	asArray(): Array<T> {
		return [...this];
	}

	filter<T extends ListTypes>(fn: (wrap: DirentWrapper) => boolean): List<T> {
		const filtered = this.dirWrap.filter(fn);
		return List.from(filtered);
	}

	only(type: 'directories' | 'dirs'): List<Directory>
	only(type: 'files'): List<File>
	only(type: 'files' | 'directories' | 'dirs') {
		switch(type) {
		case 'files':
			return this.filter<File>((wrap) => wrap.isFile());
		case 'dirs':
		case 'directories':
			return this.filter<Directory>((wrap) => wrap.isDirectory());
		}
	}

	/**
	 * @deprecated Deprecated from version 0.5 use only instead
	 */
	filterByType(direntMethod: DirentMethodsName) {
		return this.filter((wrap) => wrap[direntMethod]());
	}

	// TODO: THINK ABOUT THIS
	// asStringArray(): [string][]
	// asStringArray<T extends Array<keyof DirentWrapper>, U = ReturnTypeTuble<T>[]>(...params: T): U
	// asStringArray<T extends Array<keyof DirentWrapper>, U = ReturnTypeTuble<T>[]>(...params: T): U {
	// 	if(params.length === 0) {
	// 		params.push('name');
	// 	}
	// 	return this.dirWrap.map((wrap: DirentWrapper) => {
	// 		return params.map((param) => {
	// 			if(typeof wrap[param] === 'function') {
	// 				return (wrap[param] as () => unknown)();
	// 			} else {
	// 				return wrap[param];
	// 			}
	// 		});
	// 	}) as U; 
	// }


	*[Symbol.iterator](): IterableIterator<T> {
		for(const wrap of this.dirWrap) {
			if(wrap.isDirectory()) {
				yield wrap.dir.subDir(wrap.name) as T;
			} else {
				yield wrap.dir.file(wrap.name) as T;
			}
		}
	}
}