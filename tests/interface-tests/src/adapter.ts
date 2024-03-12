import { test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import type { SourceAdapter } from '@loom-io/core';
import { describe } from 'node:test';


export interface TestAdapterOptions {
	beforeAll?: () => Promise<void>;
	afterAll?: () => Promise<void>;
	beforeEach?: () => Promise<void>;
	afterEach?: () => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const TestAdapter = (adapter: SourceAdapter, config: TestAdapterOptions ) => {
	describe('Adapter', async () => {

		if (config.beforeAll) {
			beforeAll(config.beforeAll);
		}

		if (config.afterAll) {
			afterAll(config.afterAll);
		}

		if (config.beforeEach) {
			beforeEach(config.beforeEach);
		}

		if (config.afterEach) {
			afterEach(config.afterEach);
		}

		test('mkdir', async () => {
			const path = 'test/1/2/3/long/deep/path/empty';
			await adapter.mkdir(path);
			await expect(adapter.dirExists(path)).resolves.toBe(true);
		});

		test('mkdir with bucket', async () => {
			const path = '7/2/3/long/deep/path';
			await adapter.mkdir(path);
			await expect(adapter.dirExists(path)).resolves.toBe(true);
		});

		test('rmdir', async () => {
			const path = 'test/long/rmdir';

			await adapter.mkdir(path);
			await adapter.rmdir(path);
			await expect(adapter.dirExists(path)).resolves.toBe(false);
			await expect(adapter.dirExists('test/1/2/3')).resolves.toBe(true);
		});

		test('rmdir with file should fail', async () => {
			const path = '7/2/3/long';
			const fileName = 'file.txt';

			await adapter.mkdir(path);
			await adapter.writeFile(`${path}/${fileName}`, 'test');
			await expect(adapter.rmdir(path)).rejects.toThrow();
			await expect(adapter.dirExists(path)).resolves.toBe(true);
			await expect(adapter.dirExists('7/2/3')).resolves.toBe(true);
		});

		test('exists', async () => {

			await adapter.mkdir('test/exists');
			await expect(adapter.dirExists('test/exists')).resolves.toBe(true);
		});

		test('exists with path', async () => {

			await adapter.mkdir('test/1/2/3/exists');
			await expect(adapter.dirExists('test/1/2/3/exists')).resolves.toBe(true);
			await expect(adapter.dirExists('test/1/2')).resolves.toBe(true);
		});

		test('not exists', async () => {

			await expect(adapter.dirExists('test-not-exists')).resolves.toBe(false);
		});

		test('list dir content', async () => {

			await adapter.writeFile('list-dir-content/list/file.txt', 'test');
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

			const firstLevelDirsAndFiles = new Set<string>();
			const dirPromises = dirs.map(async (dir) => {
				const first = dir.split('/')[0];
				firstLevelDirsAndFiles.add(first);
				await adapter.mkdir(`${baseRepo}/${dir}`);
			});
			const filePromises = files.map(async (file) => {
				const first = file.split('/')[0];
				firstLevelDirsAndFiles.add(first);
				await adapter.writeFile(`${baseRepo}/${file}`, Math.random().toString());
			});

			await Promise.all([...dirPromises, ...filePromises]);

			const list = await adapter.readdir(baseRepo);
			expect(list.length).toBe(firstLevelDirsAndFiles.size);
			const [dirCount, fileCount] = list.reduce((acc, dirent) => {
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

			const path = 'test/1/2/3/long/deep/path/test.txt';
			const content = 'test-cotntent';
			await adapter.writeFile(path, content);
			expect((await adapter.readFile(path)).toString('utf-8')).toBe(content);
		});

		test('file exists', async () => {

			const path = 'exists.js';
			const content = 'export const exists = true';
			await adapter.writeFile(path, content);
			await expect(adapter.fileExists(path)).resolves.toBe(true);
		});

		test('file not exists', async () => {

			await expect(adapter.fileExists('not-exists.js')).resolves.toBe(false);
		});

		test('file exists deep path', async () => {

			const path = 'deep/path/test.txt';
			const content = 'test-cotntent';
			await adapter.mkdir('deep/path/test');
			await expect(adapter.fileExists(path)).resolves.toBe(false);
			await adapter.writeFile(path, content);
			await expect(adapter.fileExists(path)).resolves.toBe(true);
		});

		test('stat for file', async () => {

			const path = 'to-delete.txt';
			const content = 'test-content';
			await adapter.writeFile(path, content);
			await expect(adapter.fileExists(path)).resolves.toBe(true);
			const stat = await adapter.stat(path);
			expect(stat.size).toBe(content.length);
			expect(stat.mtime).toBeInstanceOf(Date);
			expect(stat.mtime.getTime()).toBeGreaterThanOrEqual(Date.now() - 2000);
		});

		test('delete file', async () => {

			const path = 'to-delete.txt';
			const content = 'test-content';
			await adapter.writeFile(path, content);
			await expect(adapter.fileExists(path)).resolves.toBe(true);
			await adapter.deleteFile(path);
			await expect(adapter.fileExists(path)).resolves.toBe(false);
		});

		test('delete file deep path', async () => {

			const path = 'deep/path/file/to-delete.txt';
			const content = 'test-content';
			await adapter.writeFile(path, content);
			await expect(adapter.fileExists(path)).resolves.toBe(true);
			await adapter.deleteFile(path);
			await expect(adapter.fileExists(path)).resolves.toBe(false);
			await expect(adapter.dirExists('deep/path')).resolves.toBe(true);
		});

		test('open file handler', async () => {

			const path = 'open-file-handler.txt';
			const content = 'test-content';
			await adapter.writeFile(path, content);
			const handler = await adapter.openFile(path);
			expect(handler).toBeDefined();
			await handler.close();
		});

		test('read partial file with buffer', async () => {

			const path = 'read-partial-file.txt';
			const content = 'test-content';
			await adapter.writeFile(path, content);
			const handler = await adapter.openFile(path);
			const buffer = Buffer.alloc(7);
			const { bytesRead, buffer: ref } = await handler.read(buffer, { position: 5 });
			expect(bytesRead).toBe(7);
			expect(ref).toBe(buffer);
			expect(ref.toString('utf-8')).toBe('content');
			expect(buffer.toString('utf-8')).toBe('content');
			await handler.close();
		});

		test('read partial file with buffer and offset', async () => {

			const path = 'read-partial-file.txt';
			const content = 'test-content';
			await adapter.writeFile(path, content);
			const handler = await adapter.openFile(path);
			const buffer = Buffer.alloc(12);
			const { bytesRead, buffer: ref } = await handler.read(buffer, { position: 5 });
			const convertToCleanString = (buffer: Buffer) => buffer.toString('utf-8').substring(0, buffer.indexOf('\0'));
			expect(bytesRead).toBe(7);
			expect(ref).toBe(buffer);
			expect(buffer).toStrictEqual(Buffer.from('content\0\0\0\0\0')); // buffer allocated with 12 bytes
			expect(convertToCleanString(buffer)).toBe('content');
			await handler.read(buffer, { position: 4, length: 1, offset: bytesRead });
			expect(convertToCleanString(buffer)).toBe('content-');
			await handler.read(buffer, { length: 4, offset: bytesRead + 1 });
			expect(buffer.toString('utf-8')).toBe('content-test');
			await handler.close();
		});

	});
};

