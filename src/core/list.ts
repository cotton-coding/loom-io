import { Dirent } from 'fs';
import { Directory } from './dir.js';
import { DirentWrapper } from './wrapper/dirent.js';


type PickMatching<T, V> =
    { [K in keyof T as T[K] extends V ? K : never]: T[K] }
type DirentMethodsName = keyof PickMatching<DirentWrapper, () => unknown>;
type ReturnTypeTuble<T extends Array<keyof DirentWrapper>> = {
    [K in keyof T]: DirentWrapper[T[K]] extends () => unknown ? ReturnType<DirentWrapper[T[K]]> : DirentWrapper[T[K]]
}

export class List {

	protected dirWrap: DirentWrapper[];

	constructor(direntWrapper: DirentWrapper[])
	constructor(dir: Directory, paths: Dirent[])
	constructor(
		dirOrDirentWrapper: Directory | DirentWrapper[],
		_paths?: Dirent[])
	{
		this.dirWrap = [];
		this.add(dirOrDirentWrapper, _paths);
	}

	add(paths: DirentWrapper[]): void
	add(dir: Directory, paths: Dirent[]): void
	add(dirOrDirentWrapper: Directory | DirentWrapper[], paths?: Dirent[]): void
	add(list: List): void
	add(dirOrListOrDirentWrapper: Directory | DirentWrapper[] | List, paths?: Dirent[]) {

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

	concat(...lists: List[]): List {
		const newList = new List(this.dirWrap);
		for(const list of lists) {
			newList.add(list.dirWrap);
		}

		return newList;
	}

	get length() {
		return this.dirWrap.length;
	}

	asArray() {
		return this.dirWrap.map((wrap) => {
			if(wrap.isDirectory()) {
				return wrap.dir.subdir(wrap.name);
			} else {
				return wrap.dir.file(wrap.name);
			}
		});
	}

	filter(fn: (wrap: DirentWrapper) => boolean) {
		const filtered = this.dirWrap.filter(fn);
		return new List(filtered);
	}

	filterByDirent(direntMethod: DirentMethodsName) {
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


	*[Symbol.iterator]() {
		for(const wrap of this.dirWrap) {
			if(wrap.isDirectory()) {
				yield wrap.dir.subdir(wrap.name);
			} else {
				yield wrap.dir.file(wrap.name);
			}
		}
	}
}