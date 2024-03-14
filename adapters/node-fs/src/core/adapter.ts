import { FileHandler } from './file-handler.js';
import * as fs from 'node:fs/promises';
import type { SourceAdapter, rmdirOptions, ObjectDirentInterface } from '@loom-io/core';
import { PathNotExistsException } from '@loom-io/core';
import { PathLike } from 'node:fs';
import { resolve } from 'node:path';
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

	async deleteFile(path: PathLike): Promise<void> {
		this.validatePath(path);
		await fs.rm(path);
	}

	get raw() {
		return fs;
	}

	protected validatePath(path: PathLike): void {
		if(this.rootdir !== undefined && !path.toString().startsWith(this.rootdir)) {
			throw new Error(`Path ${path} is not in root directory ${this.rootdir}`);
		}
	}

	protected async exists(path: string, ref: number): Promise<boolean> {
		this.validatePath(path);
		try {
			await fs.access(path, ref);
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
		this.validatePath(path);
		await fs.mkdir(path, { recursive: true });
	}

	async readdir(path: PathLike): Promise<ObjectDirentInterface[]> {
		this.validatePath(path);
		const paths =  await fs.readdir(path, {withFileTypes: true});
		return paths;
	}

	async rmdir(path: string, options: rmdirOptions= {}): Promise<void> {
		this.validatePath(path);
		if(!options.recursive || !options.force) {
			await fs.rmdir(path);
		} else {
			await fs.rm(path, options);
		}
	}

	async stat (path: string) {
		const {size, mtime} = await fs.stat(path);
		return {
			size,
			mtime
		};
	}

	async readFile(path: string): Promise<Buffer>
	async readFile(path: string, encoding: BufferEncoding): Promise<string>
	async readFile(path: string, encoding?: BufferEncoding): Promise<Buffer | string> {
		this.validatePath(path);
		return await fs.readFile(path, encoding);
	}

	async writeFile(path: string, data: Buffer | string): Promise<void> {
		try {
			this.validatePath(path);
			await fs.writeFile(path, data);
		} catch (err) {
			if(isNodeErrnoExpression(err)) {
				switch(err.code) {
				case 'ENOENT':
					throw new PathNotExistsException(path);
				}
			}
			throw err;
		}
	}

	async openFile(path: string, mode: 'r' | 'w' = 'r'): Promise<FileHandler> {
		this.validatePath(path);
		const fileHandle = await fs.open(path, mode);
		return new FileHandler(fileHandle);
	}

}