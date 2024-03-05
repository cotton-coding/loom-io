import { describe, test, expect, beforeAll } from 'vitest';
import { Adapter } from './adapter';
import { Client } from 'minio';


class UnwrappedAdapter extends Adapter {
	public async createEmptyDirectory(bucket: string, path: string): Promise<void> {
		return super.createEmptyDirectory(bucket, path);
	}

	public async createBucket(path: string): Promise<void> {
		return super.createBucket(path);
	}

	public async getBucketNameAndPath(path: string): Promise<[string, string]> {
		return super.getBucketNameAndPath(path);
	}
}

describe('Adapter', () => {

	let s3: Client;

	beforeAll(() => {
		s3 = new Client({
			endPoint: 'localhost',
			port: 9000,
			useSSL: false,
			accessKey: 'minioadmin',
			secretKey: 'minioadmin'
		});
	});

	test('mkdir', async () => {
		const path = 'test/1/2/3/long/deep/path';
		const adapter = new Adapter(s3);
		await adapter.mkdir(path);
		await expect(adapter.exists(path)).resolves.toBe(true);
	});

	test('mkdir with bucket', async () => {
		const path = '7/2/3/long/deep/path';
		const adapter = new Adapter(s3, 'test');
		await adapter.mkdir(path);
		await expect(adapter.exists(path)).resolves.toBe(true);
	});

	test('rmdir', async () => {
		const path = 'test/1/2/3/long';
		const adapter = new Adapter(s3);
		await adapter.mkdir(path);
		await adapter.rmdir(path);
		await expect(adapter.exists(path)).resolves.toBe(false);
		await expect(adapter.exists('test/1/2/3')).resolves.toBe(true);
	});

	test('rmdir with file should fail', async () => {
		const path = '7/2/3/long';
		const fileName = 'file.txt';
		const adapter = new Adapter(s3, 'test');
		await adapter.mkdir(path);
		await adapter.write(`${path}/${fileName}`, 'test');
		await adapter.rmdir(path);
		await expect(adapter.exists(path)).resolves.toBe(false);
		await expect(adapter.exists('7/2/3')).resolves.toBe(true);
	});

	test('exists', async () => {
		const adapter = new Adapter(s3);
		await adapter.mkdir('test');
		await expect(adapter.exists('test')).resolves.toBe(true);
	});

	test('exists with path', async () => {
		const adapter = new Adapter(s3);
		await adapter.mkdir('test/1/2/3');
		await expect(adapter.exists('test/1/2/3')).resolves.toBe(true);
		await expect(adapter.exists('test/1/2')).resolves.toBe(true);
	});

	test('not exists', async () => {
		const adapter = new Adapter(s3);
		await expect(adapter.exists('test-not-exists')).resolves.toBe(false);
	});

	test('read and write', async () => {
		const adapter = new Adapter(s3);
		const path = 'test/1/2/3/long/deep/path/test.txt';
		const content = 'test-content';
		await adapter.write(path, content);
		expect((await adapter.read(path)).toString('utf-8')).toBe(content);

	});

	describe('Protected methods', () => {

		test('getBucketNameAndPath with short path', async () => {
			const adapter = new UnwrappedAdapter(s3);
			const [bucket, path] = await adapter.getBucketNameAndPath('test');
			expect(bucket).toBe('test');
			expect(path).toBe('');
		});

		test('getBucketNameAndPath', async () => {
			const adapter = new UnwrappedAdapter(s3);
			const [bucket, path] = await adapter.getBucketNameAndPath('test/path');
			expect(bucket).toBe('test');
			expect(path).toBe('path');
		});
	});
});