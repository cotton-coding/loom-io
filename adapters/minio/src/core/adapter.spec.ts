import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { Adapter } from './adapter';
import { Client } from 'minio';
import { afterEach, beforeEach } from 'node:test';

const DEFAULT_BUCKET = `cotten-coding-${Math.random().toString(36).substring(7)}`;
const createdBuckets: string[] = [];

async function createBucketIfNotExists(client: Client, bucket: string) {
	const doesBucketExist = await client.bucketExists(bucket);
	if (!doesBucketExist) {
		await client.makeBucket(bucket);
		createdBuckets.push(bucket);
	}
}


async function createAdapter(client: Client, bucket: string = DEFAULT_BUCKET): Promise<Adapter> {
	await createBucketIfNotExists(client, bucket);
	return new Adapter(
		client,
		bucket
	);
}

describe('Adapter', () => {

	let s3: Client;

	beforeAll(async () => {
		s3 = new Client({
			endPoint: 'play.min.io',
			port: 9000,
			useSSL: true,
			accessKey: 'Q3AM3UQ867SPQQA43P2F',
			secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG',
		});

		// Create default bucket
		await createBucketIfNotExists(s3, DEFAULT_BUCKET);

	});

	beforeEach(async () => {
		// Create default bucket
		await createBucketIfNotExists(s3, DEFAULT_BUCKET);
	});

	afterEach(async () => {
		await Promise.all(createdBuckets.map(bucket => s3.removeBucket(bucket)));
	});

	test('mkdir', async () => {
		const path = 'test/1/2/3/long/deep/path/empty';
		const adapter = await createAdapter(s3);
		await adapter.mkdir(path);
		await expect(adapter.exists(path)).resolves.toBe(true);
	});

	test('mkdir with bucket', async () => {
		const path = '7/2/3/long/deep/path';
		const adapter = await createAdapter(s3, 'test');
		await adapter.mkdir(path);
		await expect(adapter.exists(path)).resolves.toBe(true);
	});

	test('rmdir', async () => {
		const path = 'test/long/rmdir';
		const adapter = await createAdapter(s3);
		await adapter.mkdir(path);
		await adapter.rmdir(path);
		await expect(adapter.exists(path)).resolves.toBe(false);
		await expect(adapter.exists('test/1/2/3')).resolves.toBe(true);
	});

	test('rmdir with file should fail', async () => {
		const path = '7/2/3/long';
		const fileName = 'file.txt';
		const adapter = await createAdapter(s3);
		await adapter.mkdir(path);
		await adapter.write(`${path}/${fileName}`, 'test');
		await expect(adapter.rmdir(path)).rejects.toThrow();
		await expect(adapter.exists(path)).resolves.toBe(true);
		await expect(adapter.exists('7/2/3')).resolves.toBe(true);
	});

	test('exists', async () => {
		const adapter = await createAdapter(s3);
		await adapter.mkdir('test/exists');
		await expect(adapter.exists('test/exists')).resolves.toBe(true);
	});

	test('exists with path', async () => {
		const adapter = await createAdapter(s3);
		await adapter.mkdir('test/1/2/3/exists');
		await expect(adapter.exists('test/1/2/3/exists')).resolves.toBe(true);
		await expect(adapter.exists('test/1/2')).resolves.toBe(true);
	});

	test('not exists', async () => {
		const adapter = await createAdapter(s3);
		await expect(adapter.exists('test-not-exists')).resolves.toBe(false);
	});

	test('list dir content', async () => {
		const adapter = await createAdapter(s3);
		await adapter.write('list-dir-content/list/file.txt', 'test');
		const list = await adapter.readdir('list-dir-content/list/');
		expect(list.length).toBe(1);
		expect(list[0].name).toEqual('file.txt');
		expect(list[0].isFile()).toBe(true);
		expect(list[0].isDirectory()).toBe(false);
		expect(list[0].path).toEqual('list-dir-content/list');
	});

	test('list dir content with multiple sub directories and files', async () => {
		const baseRepo = 'some/cotton-coding/loom-io';
		const dirs = ['a/cow', 'b/ape', 'c/human', 'cotton', 'cotton-coding', 'loom-io', 'some'];
		const files = ['some/file.txt', 'cotton-file.md', 'not-ignore-this.yml', 'there-is-more.txt'];
		const adapter = await createAdapter(s3);
		const firstLevelDirsAndFiles = new Set<string>();
		const dirPromises = dirs.map(async (dir) => {
			const first = dir.split('/')[0];
			firstLevelDirsAndFiles.add(first);
			await adapter.mkdir(`${baseRepo}/${dir}`);
		});
		const filePromises = files.map(async (file) => {
			const first = file.split('/')[0];
			firstLevelDirsAndFiles.add(first);
			await adapter.write(`${baseRepo}/${file}`, Math.random().toString());
		});

		await Promise.all([...dirPromises, ...filePromises]);

		const list = await adapter.readdir(baseRepo);
		expect(list.length).toBe(firstLevelDirsAndFiles.size);
		let [dirCount, fileCount] = list.reduce((acc, dirent) => {
			if (dirent.isDirectory()) {
				acc[0]++;
			}
			if (dirent.isFile()) {
				acc[1]++;
			}
			return acc;
		}, [0, 0]);

		expect(dirCount).toBe(dirs.length);
		expect(fileCount).toBe(3);

	});

	test('read and write', async () => {
		const adapter = await createAdapter(s3);
		const path = 'test/1/2/3/long/deep/path/test.txt';
		const content = 'test-cotntent';
		await adapter.write(path, content);
		expect((await adapter.read(path)).toString('utf-8')).toBe(content);

	});
});