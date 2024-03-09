import type { BucketItem, Client }	from 'minio';
import { SourceAdapter, type ObjectDirentInterface, type rmdirOptions } from '@loom-io/core';
import { ObjectDirent } from './objectDirent.js';
export class Adapter implements SourceAdapter {
	constructor(
		protected s3: Client,
		protected bucket: string
	) {
	}
	deleteFile(path: string): Promise<void> {
		throw new Error('Method not implemented.');
	}

	async exists(path: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const pathWithTailSlash = path.endsWith('/') ? path : path + '/';
			const bucketStream = this.s3.listObjects(this.bucket, pathWithTailSlash);
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

	async mkdir(path: string): Promise<void> {
		const pathWithTailSlash = path.endsWith('/') ? '' : `${path}/`;
		await this.s3.putObject(this.bucket, pathWithTailSlash, Buffer.alloc(0));
	}

	protected async rmdirRecursive(bucket: string, path: string): Promise<void> {
		const objects = await this.s3.listObjects(bucket, path);
		for await (const obj of objects) {
			await this.s3.removeObject(bucket, obj.name);
		}
	}

	protected async rmdirForce(path: string): Promise<void> {
		const pathWithTailSlash = path.endsWith('/') ? path : `${path}/`;
		await this.s3.removeObject(this.bucket, pathWithTailSlash, { forceDelete: true });
	}

	protected async rmDirRecursive(bucket: string, path: string): Promise<void> {
		const objects = await this.filesInDir(path);
		const names = objects.map((obj) => obj.name).filter((name): name is string => typeof name === 'string');
		await this.s3.removeObjects(bucket, names);
	}

	protected async dirHasFiles(path: string): Promise<boolean> {
		const pathWithTailSlash = path.endsWith('/') ? path : `${path}/`;
		const bucketStream = await this.s3.listObjects(this.bucket, pathWithTailSlash);
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
		const pathWithTailSlash = path.endsWith('/') ? path : `${path}/`;
		const bucketStream = await this.s3.listObjects(this.bucket, pathWithTailSlash);
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
		// TODO: Check if directory is empty and throw error if not and force is not set
		if(options.force) {
			await this.rmdirForce(path);
			return;
		} else if (options.recursive) {
			await this.rmdirRecursive(this.bucket, path);
			return;
		} else {
			if(await this.dirHasFiles(path)) {
				throw new Error('Directory is not empty');
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

}