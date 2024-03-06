import { describe, test, expect, beforeAll } from 'vitest';
import { Adapter } from './adapter';
import { Client } from 'minio';


function createAdapter(client: Client, bucket: string = 'cotton-coding'): Adapter {
	const doesBucketExist = client.bucketExists(bucket);
	if (!doesBucketExist) {
		client.makeBucket(bucket);
	}
	return new Adapter(
		client,
		bucket
	);
}

describe('Adapter', () => {

	let s3: Client;

	beforeAll(() => {
		s3 = new Client({
			endPoint: 'play.min.io',
			port: 9000,
			useSSL: true,
			accessKey: 'Q3AM3UQ867SPQQA43P2F',
			secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG',
		});
	});

	test('mkdir', async () => {
		const path = 'test/1/2/3/long/deep/path/empty';
		const adapter = createAdapter(s3);
		await adapter.mkdir(path);
		await expect(adapter.exists(path)).resolves.toBe(true);
	});

	test('mkdir with bucket', async () => {
		const path = '7/2/3/long/deep/path';
		const adapter = createAdapter(s3, 'test');
		await adapter.mkdir(path);
		await expect(adapter.exists(path)).resolves.toBe(true);
	});

	test('rmdir', async () => {
		const path = 'test/long/rmdir';
		const adapter = createAdapter(s3);
		await adapter.mkdir(path);
		await adapter.rmdir(path);
		await expect(adapter.exists(path)).resolves.toBe(false);
		await expect(adapter.exists('test/1/2/3')).resolves.toBe(true);
	});

	test('rmdir with file should fail', async () => {
		const path = '7/2/3/long';
		const fileName = 'file.txt';
		const adapter = createAdapter(s3);
		await adapter.mkdir(path);
		await adapter.write(`${path}/${fileName}`, 'test');
		await expect(adapter.rmdir(path)).rejects.toThrow();
		await expect(adapter.exists(path)).resolves.toBe(true);
		await expect(adapter.exists('7/2/3')).resolves.toBe(true);
	});

	test('exists', async () => {
		const adapter = createAdapter(s3);
		await adapter.mkdir('test/exists');
		await expect(adapter.exists('test/exists')).resolves.toBe(true);
	});

	test('exists with path', async () => {
		const adapter = createAdapter(s3);
		await adapter.mkdir('test/1/2/3/exists');
		await expect(adapter.exists('test/1/2/3/exists')).resolves.toBe(true);
		await expect(adapter.exists('test/1/2')).resolves.toBe(true);
	});

	test('not exists', async () => {
		const adapter = createAdapter(s3);
		await expect(adapter.exists('test-not-exists')).resolves.toBe(false);
	});

	test('read and write', async () => {
		const adapter = createAdapter(s3);
		const path = 'test/1/2/3/long/deep/path/test.txt';
		const content = 'test-content';
		await adapter.write(path, content);
		expect((await adapter.read(path)).toString('utf-8')).toBe(content);

	});
});