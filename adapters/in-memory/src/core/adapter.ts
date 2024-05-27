import { FileHandler } from './file-handler.js';
import { type SourceAdapter, type rmdirOptions, type ObjectDirentInterface, PathNotExistsException, DirectoryNotEmptyException } from '@loom-io/core';
import { AlreadyExistsException, NotFoundException } from '../exceptions.js';
import { ObjectDirent } from './object-dirent.js';
import { MEMORY_TYPE, MemoryDirectory, MemoryFile, MemoryObject, MemoryRoot } from '../definitions.js';
import { isMemoryDirectoryAndMatchNamePrepared } from '../utils/validations.js';
import { removePrecedingAndTrailingSlash, splitTailingPath } from '@loom-io/common';
import { basename, dirname } from 'path';
export class Adapter implements SourceAdapter {

	protected storage: MemoryRoot;
	constructor() {
		this.storage = {
			$type: MEMORY_TYPE.ROOT,
			content: []
		};
	}

	protected compareNameAndType<T extends MemoryObject>(item: T, name: string, type?: MEMORY_TYPE): item is T{
		const isFile = (item: MemoryObject) => item.$type === MEMORY_TYPE.FILE && item.name === name;
		const isDir = (item: MemoryObject) => item.$type === MEMORY_TYPE.DIRECTORY && item.name === name;
		if(type === MEMORY_TYPE.FILE) {
			return isFile(item);
		} else if(type === MEMORY_TYPE.DIRECTORY) {
			return isDir(item);
		} else {
			return isFile(item) || isDir(item);
		}
	}

	protected getLastPartOfPath(path: string | undefined, ref: MEMORY_TYPE.FILE): MemoryFile;
	protected getLastPartOfPath(path: string | undefined, ref: MEMORY_TYPE.DIRECTORY): MemoryDirectory | MemoryRoot;
	protected getLastPartOfPath(path: string | undefined, ref?: MEMORY_TYPE): MemoryObject | MemoryRoot;
	protected getLastPartOfPath(path: string | undefined, ref?: MEMORY_TYPE): MemoryObject | MemoryRoot {
		path = path?.trim();
		if(path === undefined || path === '' || path === '/' || path === '.') {
			return this.storage;
		}
		const parts = removePrecedingAndTrailingSlash(path).split('/');
		const lastPart = parts.pop();
		if(lastPart === undefined) {
			return this.storage;
		}
		let currentStack = this.storage.content;
		let lastObject: MemoryDirectory | MemoryRoot = this.storage;
		for(let x = 0; x < parts.length; x++) {
			const part = parts[x];
			const element = currentStack.find(isMemoryDirectoryAndMatchNamePrepared(part));
			if(element === undefined) {
				throw new NotFoundException(path, lastObject, x);
			} else {
				currentStack = element.content;
				lastObject = element;
			}
		}
		const searchResult = currentStack.find((item) => this.compareNameAndType(item, lastPart, ref));
		if(searchResult === undefined) {
			throw new NotFoundException(path, lastObject, parts.length);
		}
		return searchResult;
	}

	protected createMissingDirectories(ref: MemoryDirectory | MemoryRoot, pathParts: string[]): MemoryDirectory | MemoryRoot {
		const currentPart = pathParts.shift();
		if(currentPart === undefined) {
			return ref;
		}
		const newDir = this.createDirectory(currentPart);
		ref.content.push(newDir);
		return this.createMissingDirectories(newDir, pathParts);
	}


	protected createDirectory(name: string, content: MemoryObject[] = []): MemoryDirectory {
		return {
			$type: MEMORY_TYPE.DIRECTORY,
			name,
			content
		};
	}


	protected createFile(name: string, content: Buffer = Buffer.alloc(0)): MemoryFile {
		const parts = name.split('.');
		const ext = parts.length > 1 ? parts[parts.length-1] : undefined;
		return {
			$type: MEMORY_TYPE.FILE,
			ext,
			name,
			mtime: new Date(),
			content
		};
	}

	protected createObject(path: string, ref: MEMORY_TYPE.FILE): MemoryFile;
	protected createObject(path: string, ref: MEMORY_TYPE.DIRECTORY): MemoryDirectory;
	protected createObject(path: string, ref: MEMORY_TYPE): MemoryObject {

		const parts = removePrecedingAndTrailingSlash(path).split('/');
		try {
			const lastPart = this.getLastPartOfPath(path);
			throw new AlreadyExistsException(path, lastPart);
		} catch (err) {
			if(err instanceof NotFoundException) {
				const {last, depth} = err;
				if(ref === MEMORY_TYPE.FILE) {
					const lastDir = this.createMissingDirectories(last, parts.slice(depth, -1));
					const file = this.createFile(parts[parts.length-1]);
					lastDir.content.push(file);
					return file;
				} else {
					return this.createMissingDirectories(last, parts.slice(depth)) as MemoryDirectory;
				}
			}

			throw err;
		}
	}

	protected exists(path: string, ref: MEMORY_TYPE): boolean {
		try {
			this.getLastPartOfPath(path, ref);
			return true;
		} catch {
			return false;
		}

	}

	fileExists(path: string): boolean {
		return this.exists(path, MEMORY_TYPE.FILE);
	}

	dirExists(path: string): boolean {
		return this.exists(path, MEMORY_TYPE.DIRECTORY);
	}

	mkdir(path: string): void {
		path = path.trim();
		if(path === '/' || path === '') {
			return;
		}
		try {
			this.createObject(path, MEMORY_TYPE.DIRECTORY);
		} catch (err) {
			if(err instanceof AlreadyExistsException) {
				return;
			}
			throw err;
		}
	}

	readdir(path: string): ObjectDirentInterface[] {
		const dir = this.getLastPartOfPath(path, MEMORY_TYPE.DIRECTORY);
		return dir.content.map((item) => new ObjectDirent(item, path.toString()));
	}

	rmdir(path: string, options: rmdirOptions= {}): void {
		try {
			const [subPath, tail] = splitTailingPath(removePrecedingAndTrailingSlash(path));
			const subElement = this.getLastPartOfPath(subPath, MEMORY_TYPE.DIRECTORY);

			if(!tail) { // Handle root directory
				if(subElement.content.length > 0 && (!options.recursive && !options.force)) {
					throw new DirectoryNotEmptyException(path);
				}
				subElement.content = [];
				return;
			}


			if((!options.recursive && !options.force)) {
				const element = subElement.content.find(isMemoryDirectoryAndMatchNamePrepared(tail));
				if(element == null) {
					throw new PathNotExistsException(path);
				}else if(element.content.length > 0) {
					throw new DirectoryNotEmptyException(path);
				}
			}

			subElement.content = subElement.content.filter((item) => !this.compareNameAndType(item, tail, MEMORY_TYPE.DIRECTORY));

		} catch (err) {
			if(err instanceof NotFoundException) {
				throw new PathNotExistsException(path);
			}
			throw err;
		}
	}

	async stat (path: string) {
		const file = this.getLastPartOfPath(path, MEMORY_TYPE.FILE);
		return {
			size: file.content.length,
			mtime: file.mtime
		};
	}

	readFile(path: string): Buffer
	readFile(path: string, encoding: BufferEncoding): string
	readFile(path: string, encoding?: BufferEncoding): Buffer | string {
		const file = this.getLastPartOfPath(path, MEMORY_TYPE.FILE);
		return encoding === undefined ? file.content : file.content.toString(encoding);
	}

	writeFile(path: string, content: Buffer): void;
	writeFile(path: string, content: string, encoding?: BufferEncoding): void;
	writeFile(path: string, content: Buffer | string, encoding: BufferEncoding = 'utf-8'): void {
		try {
			const file = this.getLastPartOfPath(path, MEMORY_TYPE.FILE);
			file.content = Buffer.isBuffer(content) ? content : Buffer.from(content, encoding);
			file.mtime = new Date();
		} catch (err) {
			if(err instanceof NotFoundException) {
				if(removePrecedingAndTrailingSlash(path).split('/').length === err.depth + 1) {
					const [,tail] = splitTailingPath(path);
					if(tail === undefined) {
						throw new Error('Invalid path'); // TODO: Create a custom exception
					}
					const file = this.createFile(tail, Buffer.isBuffer(content) ? content : Buffer.from(content, encoding));
					err.last.content.push(file);
					return;
				}
				throw new PathNotExistsException(path);
			}
			throw err;
		}
	}

	deleteFile(path: string): void {
		const [subPath, tail] = splitTailingPath(path);
		if(tail === undefined) {
			throw new Error('Invalid path'); // TODO: Create a custom exception
		}
		const subElement = this.getLastPartOfPath(subPath, MEMORY_TYPE.DIRECTORY);
		subElement.content = subElement.content.filter((item) => !this.compareNameAndType(item, tail, MEMORY_TYPE.FILE));
	}

	openFile(path: string, mode: 'r' | 'w' = 'r'): FileHandler {
		const file = this.getLastPartOfPath(path, MEMORY_TYPE.FILE);
		return new FileHandler(file, mode);
	}

	isCopyable<T extends SourceAdapter>(adapter: T): boolean {
		if(adapter instanceof Adapter) {
			return (adapter as Adapter) === this;
		}
		return false;
	}

	copyFile(from: string, to: string): void {
		let fromExists = false;
		try {
			const file = this.getLastPartOfPath(from, MEMORY_TYPE.FILE);
			fromExists = true;
			const target = dirname(to);
			const newFileName = basename(to);
			const subElement = this.getLastPartOfPath(target, MEMORY_TYPE.DIRECTORY);
			subElement.content.push(this.createFile(newFileName, file.content));
		} catch (err) {
			if(err instanceof NotFoundException) {
				throw new PathNotExistsException(fromExists ? to : from);
			}
			throw err;
		}
	}

}