import type { BucketItem, Client }	from 'minio';
import { ObjectDirent } from './object-dirent.js';
import { FileHandler } from './file-handler.js';
import { type SourceAdapter, type rmdirOptions, type ObjectDirentInterface, DirectoryNotEmptyException } from '@loom-io/core';
import { removePrecedingSlash } from '@loom-io/common';

function addTailSlash(path: string): string {
	return path.endsWith('/') ? path : `${path}/`;
}

export class Adapter implements SourceAdapter {
	constructor(
		protected s3: Client,
		protected bucket: string
	) {
	}
	async deleteFile(path: string): Promise<void> {
		await this.s3.removeObject(this.bucket, path);
	}

	get raw() {
		return this.s3;
	}

	get bucketName() {
		return this.bucket;
	}

	protected async exists(path: string): Promise<boolean> {

		const bucketStream = this.s3.listObjectsV2(this.bucket, path);
		return new Promise((resolve, reject) => {

			bucketStream.on('data', () => {
				bucketStream.destroy();
				resolve(true);
			});
			bucketStream.on('end', () => {
				resolve(false);
			});
			bucketStream.on('error', (err) => {
				reject(err);
			});
		});
	}

	async fileExists(path: string): Promise<boolean> {
		return this.exists(path);
	}

	async dirExists(path: string): Promise<boolean> {
		const pathWithTailSlash = addTailSlash(path);
		if(path === '/') {
			return true;
		}
		return this.exists(pathWithTailSlash);
	}


	async mkdir(path: string): Promise<void> {
		const pathWithTailSlash = removePrecedingSlash(addTailSlash(path));
		if(pathWithTailSlash === '') {
			return;
		}
		await this.s3.putObject(this.bucket, pathWithTailSlash, Buffer.alloc(0));
	}

	protected async rmdirRecursive(bucket: string, path: string): Promise<void> {
		path = removePrecedingSlash(addTailSlash(path));
		const objects = await this.s3.listObjectsV2(bucket, path, true);
		for await (const obj of objects) {
			await this.s3.removeObject(bucket, obj.name);
		}
	}

	protected async rmdirForce(path: string): Promise<void> {
		const pathWithTailSlash = removePrecedingSlash(addTailSlash(path));
		if(pathWithTailSlash === '') {
			await this.rmdirRecursive(this.bucket, pathWithTailSlash);
			return;
		}
		await this.s3.removeObject(this.bucket, pathWithTailSlash, { forceDelete: true });
	}

	protected async dirHasFiles(path: string): Promise<boolean> {
		const pathWithTailSlash = path.endsWith('/') ? path : `${path}/`;
		const bucketStream = await this.s3.listObjectsV2(this.bucket, pathWithTailSlash);
		return new Promise((resolve, reject) => {
			bucketStream.on('data', (data) => {
				if(data.name?.endsWith('/')) {
					return;
				}
				resolve(true);
				bucketStream.destroy();
			});
			bucketStream.on('end', () => {
				resolve(false);
			});
			bucketStream.on('error', (err) => {
				reject(err);
			});
		});
	}

	protected async filesInDir(path: string): Promise<BucketItem[]> {
		const pathWithTailSlash = path.endsWith('/') ? path : `${path}/`;
		const bucketStream = await this.s3.listObjects(this.bucket, pathWithTailSlash);
		return new Promise((resolve, reject) => {
			const files: BucketItem[] = [];
			bucketStream.on('data', (data) => {
				files.push(data);
			});
			bucketStream.on('end', () => {
				resolve(files);
			});
			bucketStream.on('error', (err) => {
				reject(err);
			});
		});
	}

	async readdir(path: string): Promise<ObjectDirentInterface[]> {
		const pathWithTailSlash = removePrecedingSlash(addTailSlash(path));
		const bucketStream = await this.s3.listObjectsV2(this.bucket, pathWithTailSlash, false);
		return new Promise((resolve, reject) => {
			const pathObjects: ObjectDirent[] = [];
			bucketStream.on('data', (data) => {
				if(data.name === pathWithTailSlash || data.prefix === pathWithTailSlash) {
					return;
				}
				const dirent = new ObjectDirent(data);
				pathObjects.push(dirent);
			});
			bucketStream.on('end', () => {
				resolve(pathObjects);
			});
			bucketStream.on('error', (err) => {
				reject(err);
			});
		});
	}

	async rmdir(path: string, options: rmdirOptions= {}): Promise<void> {
		if(options.force) {
			await this.rmdirForce(path);
			return;
		} else if (options.recursive) {
			await this.rmdirRecursive(this.bucket, path);
			return;
		} else {
			if(await this.dirHasFiles(path)) {
				throw new DirectoryNotEmptyException(path);
			}
			const pathWithTailSlash = path.endsWith('/') ? path : `${path}/`;
			await this.s3.removeObject(this.bucket, pathWithTailSlash);
		}
	}

	async stat (path: string) {
		const stat = await this.s3.statObject(this.bucket, path);
		return {
			size: stat.size,
			mtime: stat.lastModified
		};
	}

	async readFile(path: string): Promise<Buffer>
	async readFile(path: string, encoding: BufferEncoding): Promise<string>
	async readFile(path: string, encoding?: BufferEncoding): Promise<Buffer | string> {
		const stream = await this.s3.getObject(this.bucket, path);
		return new Promise((resolve, reject) => {
			const buffers: Buffer[] = [];
			stream.on('data', (data) => {
				buffers.push(data);
			});
			stream.on('end', () => {
				if(encoding) {
					resolve(Buffer.concat(buffers).toString(encoding));
				}
				resolve(Buffer.concat(buffers));
			});
			stream.on('error', (err) => {
				reject(err);
			});
		});
	}

	async writeFile(path: string, data: Buffer | string): Promise<void> {
		const buffer = Buffer.from(data);
		await this.s3.putObject(this.bucket, path, buffer, buffer.length, { 'Content-Type': 'text/plain' });
		return;
	}

	async openFile(path: string): Promise<FileHandler> {
		return new FileHandler(this, this.bucket, path);
	}

}