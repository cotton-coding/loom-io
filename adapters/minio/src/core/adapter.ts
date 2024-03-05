import type { Client }	from 'minio';
import { SourceAdapter } from '@loom-io/core';
import { mkdirOptions, rmdirOptions } from '../definitions';
import { join as joinPath } from 'node:path';
import { isMinioException } from '../utils/typechecks';

export class Adapter implements SourceAdapter {
	constructor(
		protected s3: Client,
		protected bucket?: string
	) {

	}

	async exists(path: string): Promise<boolean> {
		const [bucket, location] = await this.getBucketNameAndPath(path);
		if(!location || location === '') {
			return this.s3.bucketExists(bucket);
		}

		return new Promise((resolve, reject) => {
			const bucketStream = this.s3.listObjects(bucket, location);
			bucketStream.on('data', () => {
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

	protected async createBucket(path: string): Promise<void> {
		try {
			await this.s3.makeBucket(path);
		}	catch (err) {
			if(isMinioException(err)) {
				switch(err.code) {
				case 'BucketAlreadyOwnedByYou':
				case 'BucketAlreadyExists':
					return;
				}
			}
			throw err;
		}
	}

	protected async createEmptyDirectory(bucket: string, path: string): Promise<void> {
		await this.s3.putObject(bucket, path, '');
		return;
	}

	protected getBucketNameAndPath(path: string):[string, string] {
		const split = path.split('/');
		const bucket = this.bucket ?? split.shift();
		if(bucket == null) throw new Error('Bucket not provided');
		return [bucket, split.join('/')];
	}

	async mkdir(path: string): Promise<void> {
		const [bucket, location] = this.getBucketNameAndPath(path);

		await this.createBucket(bucket);
		if(location && location !== '') {
			await this.createEmptyDirectory(bucket, location);
		}
	}

	protected async rmdirRecursive(bucket: string, path: string): Promise<void> {
		const objects = await this.s3.listObjects(bucket, path);
		for await (const obj of objects) {
			await this.s3.removeObject(bucket, obj.name);
		}
	}

	async rmdir(path: string, options: rmdirOptions= {}): Promise<void> {
		try {
			const [bucket, location] = this.getBucketNameAndPath(path);
			if(!location || location === '') {
				// if(options.recursive) {
				// 	await this.rmdirRecursive(bucket, location);
				// }
				await this.s3.removeBucket(bucket);
				return;
			}
			await this.s3.removeObject(bucket, location, { forceDelete: options.force });
			const parts = path.split('/');
			parts.pop();
			//await this.mkdir(parts.join('/'));
		} catch (err) {
			console.log('rmdir', err);
			throw err;
		}
	}


	async read(path: string, encoding?: BufferEncoding): Promise<Buffer | string> {
		const [bucket, location] = this.getBucketNameAndPath(path);
		const stream = await this.s3.getObject(bucket, location);
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

	async write(path: string, data: Buffer | string): Promise<void> {
		const [bucket, location] = this.getBucketNameAndPath(path);
		const buffer = Buffer.from(data);
		await this.s3.putObject(bucket, location, buffer, buffer.length, { 'Content-Type': 'text/plain' });
		return;
	}

}