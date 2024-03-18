import { test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import type { SourceAdapter } from '@loom-io/core';
import { describe } from 'node:test';
import { faker } from '@faker-js/faker';
import { dirname, join } from 'node:path';


export interface TestAdapterOptions {
	beforeAll?: () => Promise<void>;
	afterAll?: () => Promise<void>;
	beforeEach?: () => Promise<void>;
	afterEach?: () => Promise<void>;
	basePath?: string;
}



// eslint-disable-next-line @typescript-eslint/ban-types
export const TestAdapter = (adapter: SourceAdapter, config?: TestAdapterOptions ) => {

	function getRandomPath(subpath: string): string {
		const base = config?.basePath || '';
		return join(base, faker.string.uuid(), faker.system.directoryPath().slice(1), subpath);
	}

	function getRandomFilePath(ext: string): string {
		const base = config?.basePath || '';
		return join(base, faker.string.uuid(), faker.system.directoryPath().slice(1), faker.system.commonFileName(ext));
	}

	async function getPathWithBase(subpath: string): Promise<string> {
		if(config?.basePath) {
			const base = config?.basePath || '';
			await adapter.mkdir(base);
			return join(base, subpath);
		} else {
			return subpath;
		}
	}

	describe('Adapter', async () => {

		let path: string;

		if (config?.beforeAll) {
			beforeAll(config.beforeAll);
		}

		if (config?.afterAll) {
			afterAll(config.afterAll);
		}

		beforeEach(async () => {
			path = getRandomPath('test');
			if(config?.beforeEach) {
				await config.beforeEach();
			}
		});

		if (config?.afterEach) {
			afterEach(config.afterEach);
		}

		test('mkdir', async () => {
			const path = getRandomPath('test/long/mkdir');
			await adapter.mkdir(path);
			expect(await adapter.dirExists(path)).toBe(true);
		});

		test('rmdir', async () => {
			const subPath = path.split('/').slice(0,-1).join('/');
			await adapter.mkdir(subPath);
			await adapter.mkdir(path);
			await adapter.rmdir(path);
			expect( await adapter.dirExists(path)).toBe(false);
			expect( await adapter.dirExists(subPath)).toBe(true);
		});

		test('rmdir with file should fail', async () => {
			const fileName = 'file.txt';
			await adapter.mkdir(path);
			await adapter.writeFile(`${path}/${fileName}`, 'test');
			expect(async () => await adapter.rmdir(path)).rejects.toThrow();
			expect( await adapter.dirExists(path)).toBe(true);
		});

		test('exists', async () => {
			const path = await getPathWithBase('test/exists');
			await adapter.mkdir(path);
			expect( await adapter.dirExists(path)).toBe(true);
		});

		test('exists with path', async () => {
			await adapter.mkdir(path);
			const subPath = path.split('/').slice(0,-1).join('/');
			expect( await adapter.dirExists(path)).toBe(true);
			expect( await adapter.dirExists(subPath)).toBe(true);
		});

		test('not exists', async () => {
			expect( await adapter.dirExists(await getPathWithBase('does-not-exits-in-folder'))).toBe(false);
		});

		test('should handle slashes', async () => {
			const path = '/';
			await adapter.mkdir(path);
			expect(await adapter.dirExists(path)).toBe(true);
			expect(await adapter.readdir(path)).toHaveLength(0);
		});

		test('list dir content', async () => {
			await adapter.mkdir('list-dir-content/list');
			await adapter.writeFile('list-dir-content/list/file.txt', 'test');
			const list = await adapter.readdir('list-dir-content/list/');
			expect(list.length).toBe(1);
			expect(list[0].name).toEqual('file.txt');
			expect(list[0].isFile()).toBe(true);
			expect(list[0].isDirectory()).toBe(false);
			expect(list[0].path).toEqual('list-dir-content/list/');
		});

		test('list dir content with multiple sub directories', async () => {
			const basePath = getRandomPath('list-dir-content');
			await adapter.mkdir(basePath);
			const dirs = ['a/cow', 'b/ape', 'c/human'];
			const dirPromises = dirs.map(async (dir) => {
				await adapter.mkdir(join(basePath, dir));
			});
			await Promise.all(dirPromises);
			const list = await adapter.readdir(basePath);
			expect(list.length).toBe(dirs.length);
		});

		test('list dir content with multiple sub directories and files', async () => {
			const basePath = getRandomPath('list-dir-content');
			await adapter.mkdir(basePath);
			const dirs = ['a/cow', 'b/ape', 'c/human', 'cotton', 'cotton-coding', 'loom-io', 'some'];
			const files = ['some/file.txt', 'cotton-file.md', 'not-ignore-this.yml', 'there-is-more.txt'];

			const firstLevelDirsAndFiles = new Set<string>();
			const dirPromises = dirs.map(async (dir) => {
				const first = dir.split('/')[0];
				firstLevelDirsAndFiles.add(first);
				await adapter.mkdir(join(basePath, dir));
			});
			const filePromises = files.map(async (file) => {
				const first = file.split('/')[0];
				firstLevelDirsAndFiles.add(first);
				await adapter.mkdir(dirname(join(basePath, file)));
				await adapter.writeFile(join(basePath, file), Math.random().toString());
			});

			await Promise.all([...dirPromises, ...filePromises]);

			const list = await adapter.readdir(basePath);
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

		test('write and read', async () => {
			const path = getRandomFilePath('txt');
			const content = faker.lorem.words(1000);
			await adapter.mkdir(dirname(path));
			await adapter.writeFile(path, content);
			expect( await adapter.readFile(path)).toEqual(Buffer.from(content));
		});

		test('write and read with encoding', async () => {
			const path = getRandomFilePath('txt');
			const content = faker.lorem.words(1000);
			await adapter.mkdir(dirname(path));
			await adapter.writeFile(path, content);
			expect( await adapter.readFile(path, 'utf-8')).toEqual(content);
		});

		test('file exists', async () => {
			const path = await getPathWithBase(faker.system.commonFileName('js'));
			const content = 'export const exists = true';
			await adapter.writeFile(path, content);
			expect( await adapter.fileExists(path)).toBe(true);
		});

		test('file not exists', async () => {
			expect( await adapter.fileExists(await getPathWithBase('file-not-exists.js'))).toBe(false);
		});

		test('file exists deep path', async () => {
			const path = getRandomFilePath('md');
			const content = faker.lorem.words(10);
			await adapter.mkdir(dirname(path));
			expect( await adapter.fileExists(path)).toBe(false);
			await adapter.writeFile(path, content);
			expect( await adapter.fileExists(path)).toBe(true);
		});

		test('stat for file', async () => {
			const path = getRandomFilePath('txt');
			await adapter.mkdir(dirname(path));
			const content = faker.lorem.words(100);
			await adapter.writeFile(path, content);
			expect( await adapter.fileExists(path)).toBe(true);
			const stat = await adapter.stat(path);
			expect(stat.size).toBe(content.length);
			expect(stat.mtime).toBeInstanceOf(Date);
			expect(stat.mtime.getTime()).toBeGreaterThanOrEqual(Date.now() - 2000);
		});

		test('delete file', async () => {
			const path = await getPathWithBase(faker.system.commonFileName('txt'));
			const content = faker.lorem.words(10);
			await adapter.writeFile(path, content);
			expect( await adapter.fileExists(path)).toBe(true);
			await adapter.deleteFile(path);
			expect( await adapter.fileExists(path)).toBe(false);
		});

		test('delete file deep path', async () => {
			const path = getRandomFilePath('txt');
			const dir = dirname(path);
			await adapter.mkdir(dir);
			const content = faker.lorem.words(10);
			await adapter.writeFile(path, content);
			expect( await adapter.fileExists(path)).toBe(true);
			await adapter.deleteFile(path);
			expect( await adapter.fileExists(path)).toBe(false);
			expect( await adapter.dirExists(dir)).toBe(true);
		});

		test('open file handler', async () => {
			const path = await getPathWithBase(faker.system.commonFileName('md'));
			const content = faker.lorem.words(100);
			await adapter.writeFile(path, content);
			const handler = await adapter.openFile(path);
			expect(handler).toBeDefined();
			await handler.close();
		});

		test('read partial file with buffer', async () => {
			const path = await getPathWithBase(faker.system.commonFileName('md'));
			const content = faker.lorem.paragraphs(7);
			await adapter.writeFile(path, content);
			const handler = await adapter.openFile(path);
			const buffer = Buffer.alloc(7);
			const { bytesRead, buffer: ref } = await handler.read(buffer, { position: 5 });
			expect(bytesRead).toBe(7);
			expect(ref).toBe(buffer);
			expect(ref.toString('utf-8')).toBe(content.slice(5, 12));
			expect(buffer.toString('utf-8')).toBe(content.slice(5, 12));
			await handler.close();
		});

		test('read partial file with buffer and offset', async () => {
			const path = await getPathWithBase(faker.system.commonFileName('md'));
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

