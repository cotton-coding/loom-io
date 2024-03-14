import { FileHandler } from './file-handler.js';
import * as fs from 'node:fs/promises';
import type { SourceAdapter, rmdirOptions, ObjectDirentInterface } from '@loom-io/core';
import { PathNotExistsException } from '@loom-io/core';
import { PathLike } from 'node:fs';
import { join, resolve } from 'node:path';
import { isNodeErrnoExpression } from '../utils/error-handling.js';
export class Adapter implements SourceAdapter {

	protected rootdir: string | undefined;

	constructor(
		rootdir?: PathLike,
	) {
		if(rootdir !== undefined) {
			this.rootdir = resolve(rootdir.toString());
		}
	}

	get raw() {
		return fs;
	}

	getFullPath(path: string): string {
		return join(this.rootdir || '', path);
	}

	protected async exists(path: string, ref: number): Promise<boolean> {
		const fullPath = this.getFullPath(path);
		try {
			await fs.access(fullPath, ref);
			return true;
		} catch {
			return false;
		}
	}

	async fileExists(path: string): Promise<boolean> {
		return this.exists(path, fs.constants.F_OK);
	}

	async dirExists(path: string): Promise<boolean> {
		return this.exists(path, fs.constants.R_OK);
	}


	async mkdir(path: string): Promise<void> {
		const fullPath = this.getFullPath(path);
		await fs.mkdir(fullPath, { recursive: true });
	}

	async readdir(path: PathLike): Promise<ObjectDirentInterface[]> {
		const fullPath = this.getFullPath(path.toString());
		const paths =  await fs.readdir(fullPath, {withFileTypes: true});
		return paths;
	}

	async rmdir(path: string, options: rmdirOptions= {}): Promise<void> {
		const fullPath = this.getFullPath(path);
		if(!options.recursive || !options.force) {
			await fs.rmdir(fullPath);
		} else {
			await fs.rm(fullPath, options);
		}
	}

	async stat (path: string) {
		const fullPath = this.getFullPath(path);
		const {size, mtime} = await fs.stat(fullPath);
		return {
			size,
			mtime
		};
	}

	async readFile(path: string): Promise<Buffer>
	async readFile(path: string, encoding: BufferEncoding): Promise<string>
	async readFile(path: string, encoding?: BufferEncoding): Promise<Buffer | string> {
		const fullPath = this.getFullPath(path);
		return await fs.readFile(fullPath, encoding);
	}

	async writeFile(path: string, data: Buffer | string): Promise<void> {
		const fullPath = this.getFullPath(path);
		try {
			await fs.writeFile(fullPath, data);
		} catch (err) {
			if(isNodeErrnoExpression(err)) {
				switch(err.code) {
				case 'ENOENT':
					throw new PathNotExistsException(fullPath);
				}
			}
			throw err;
		}
	}

	async deleteFile(path: PathLike): Promise<void> {
		const fullPath = this.getFullPath(path.toString());
		await fs.rm(fullPath);
	}

	async openFile(path: string, mode: 'r' | 'w' = 'r'): Promise<FileHandler> {
		const fullPath = this.getFullPath(path);
		const fileHandle = await fs.open(fullPath, mode);
		return new FileHandler(fileHandle);
	}

}