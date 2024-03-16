import { ObjectDirentInterface } from '@loom-io/core';
import { MEMORY_TYPE, MemoryObject } from '../definitions';

export class ObjectDirent implements ObjectDirentInterface{

	constructor(
		protected _object: MemoryObject,
		protected _basePath: string,
	) {}

	isDirectory() {
		return this._object.$type === MEMORY_TYPE.DIRECTORY;
	}

	isFile() {
		return this._object.$type === MEMORY_TYPE.FILE;
	}

	get name() {
		if(this._object.$type === MEMORY_TYPE.FILE) {
			return `${this._object.name}.${this._object.ext}`;
		}
		return this._object.name;
	}

	get path() {
		return this._basePath;
	}

}