import { Directory } from './dir.js';
import { DirentWrapper } from '../wrapper/dirent.js';
import type { LoomFile } from './file.js';
import { ObjectDirentInterface } from '../definitions.js';


export type ListTypes = LoomFile | Directory;

type PickMatching<T, V> =
    { [K in keyof T as T[K] extends V ? K : never]: T[K] }
type DirentMethodsName = keyof PickMatching<DirentWrapper, () => unknown>;
// type ReturnTypeTuble<T extends Array<keyof DirentWrapper>> = {
//     [K in keyof T]: DirentWrapper[T[K]] extends () => unknown ? ReturnType<DirentWrapper[T[K]]> : DirentWrapper[T[K]]
// }

export class List<T extends ListTypes = ListTypes> {

	protected _dirent: DirentWrapper[];

	static from<T extends ListTypes>(list: List<T>): List<T>
	static from<T extends ListTypes>(direntWraps: DirentWrapper[]): List<T>
	static from<T extends ListTypes>(listOrWrap: List<T> | DirentWrapper[]) {
		const list = new List<T>();
		list.add(listOrWrap);
		return list;
	}

	constructor()
	constructor(dir: Directory, paths: ObjectDirentInterface[])
	constructor(
		dir?: Directory,
		_dirent?: ObjectDirentInterface[])
	{
		if(dir && _dirent) {
			this._dirent = _dirent.map((p)  => new DirentWrapper(dir, p));
		} else {
			this._dirent = [];
		}
	}

	protected add(paths: DirentWrapper[]): void
	protected add(list: List<T>): void
	protected add(listOrWrap: List<T> | DirentWrapper[]): void
	protected add(listOrDirentWrapper: DirentWrapper[] | List<T>) {

		if(listOrDirentWrapper instanceof List) {
			this._dirent.push(...listOrDirentWrapper._dirent);
		} else {
			this._dirent.push(...listOrDirentWrapper);
		}
	}

	concat<U extends ListTypes>(...lists: Array<List<U>>): List<T | U> {
		const newList = List.from<T | U>(this);
		for(const list of lists) {
			newList.add(list);
		}

		return newList;
	}

	get length() {
		return this._dirent.length;
	}

	protected convert(wrap: DirentWrapper) {
		if(wrap.isDirectory()) {
			return wrap.dir.subDir(wrap.name);
		} else {
			return wrap.dir.file(wrap.name);
		}
	}

	at(index: number) {
		const wrap = this._dirent[index];
		return this.convert(wrap);
	}

	first<T = Directory | LoomFile>(): T {
		return this.at(0) as T;
	}

	last<T = Directory | LoomFile>(): T {
		return this.at(this.length - 1) as T;
	}

	asArray(): Array<T> {
		return [...this];
	}

	filter<T extends ListTypes>(fn: (wrap: DirentWrapper) => boolean): List<T> {
		const filtered = this._dirent.filter(fn);
		return List.from(filtered);
	}

	only(type: 'directories' | 'dirs'): List<Directory>
	only(type: 'files'): List<LoomFile>
	only(type: 'files' | 'directories' | 'dirs') {
		switch(type) {
		case 'files':
			return this.filter<LoomFile>((wrap) => wrap.isFile());
		case 'dirs':
		case 'directories':
			return this.filter<Directory>((wrap) => wrap.isDirectory());
		}
	}

	/**
	 * @deprecated Deprecated use only instead
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
		for(const wrap of this._dirent) {
			if(wrap.isDirectory()) {
				yield wrap.dir.subDir(wrap.name) as T;
			} else {
				yield wrap.dir.file(wrap.name) as T;
			}
		}
	}
}