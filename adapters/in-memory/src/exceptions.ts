import { MemoryDirectory, MemoryObject, MemoryRoot } from './definitions';

export class NotFoundException extends Error {

	protected lastObject: MemoryDirectory | MemoryRoot;
	protected level: number;

	constructor(path: string, lastObject: MemoryDirectory | MemoryRoot, level: number = 0) {
		super('Could not find ' + path);
		this.lastObject = lastObject;
		this.level = level;
	}

	get last() {
		return this.lastObject;
	}

	get depth() {
		return this.level;
	}
}

export class AlreadyExistsException extends Error {

	protected object: MemoryObject;

	constructor(path: string, object: MemoryObject) {
		super('Already exists ' + path);
		this.object = object;
	}

	get ref () {
		return this.object;
	}
}