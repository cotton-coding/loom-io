import { describe, test, expect, afterAll } from 'vitest';
import { rmdir } from 'fs/promises';
import { resolve as resolvePath } from 'node:path';
import LoomIO, { Directory, DirectoryNotEmptyException, isDirectory } from '../src/bundle';

const BASE_TEST_PATH = './tmp-test/';

const randomStrings = new Set<string>();

const createRandomDirectory = async (): Promise<Directory> => {
	const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	if ( randomStrings.has(random) ) {
		return createRandomDirectory();
	}
	randomStrings.add(random);
	return LoomIO.dir(`file://${BASE_TEST_PATH}/${random}`);
};

const deleteRandomDirectory = async (dir: Directory) => {
	const random = dir.path;
	await rmdir(resolvePath(random), {recursive: true});
	randomStrings.delete(random);
};

describe.concurrent('test integration of bundle for interacting with filesystem', () => {

	afterAll(async () => {
		await rmdir(resolvePath(BASE_TEST_PATH), {recursive: true});
	});

	describe('test base functionality', () => {

		test('create directory', async () => {
			const dir = await createRandomDirectory();
			expect(dir).toBeDefined();
			expect(isDirectory(dir)).toBeTruthy();
			await dir.create();
			expect(await dir.exists()).toBeTruthy();
			await deleteRandomDirectory(dir);
			await expect(dir.exists()).resolves.toBeFalsy();
		});

		test('delete directory', async () => {
			const dir = await createRandomDirectory();
			await dir.delete();
			expect(await dir.exists()).toBeFalsy();
		});

		test('list empty directory', async () => {
			const dir = await createRandomDirectory();
			await dir.create();
			const list = await dir.list();
			expect(list).toBeDefined();
			expect(list.length).toBe(0);
			await deleteRandomDirectory(dir);
		});

		test('list directory with files', async () => {
			const dir = await createRandomDirectory();
			await dir.create();
			const file = dir.file('test.txt');
			await file.create();
			const list = await dir.list();
			expect(list).toBeDefined();
			expect(list.length).toBe(1);
			await deleteRandomDirectory(dir);
		});

		test('delete directory with files', async () => {
			const dir = await createRandomDirectory();
			await dir.create();
			const file = dir.file('test.txt');
			await file.create();
			expect(await dir.exists()).toBeTruthy();
			expect(await file.exists()).toBeTruthy();
			await expect(dir.delete()).rejects.toThrow(DirectoryNotEmptyException);
			await dir.delete(true);
			expect(await dir.exists()).toBeFalsy();
		});

		test('create file', async () => {
			const dir = await createRandomDirectory();
			await dir.create();
			const file = dir.file('test.txt');
			await file.create();
			expect(await file.exists()).toBeTruthy();
			await deleteRandomDirectory(dir);
		});

		test('delete file', async () => {
			const dir = await createRandomDirectory();
			await dir.create();
			const file = dir.file('test.txt');
			await file.create();
			expect(await file.exists()).toBeTruthy();
			await file.delete();
			expect(await file.exists()).toBeFalsy();
			await deleteRandomDirectory(dir);
		});

		test('write file', async () => {
			const dir = await createRandomDirectory();
			await dir.create();
			const file = dir.file('test.txt');
			await file.create();
			const content = 'test content';
			await file.write(content);
			expect(await file.text()).toBe(content);
			await deleteRandomDirectory(dir);
		});

		test('read file', async () => {
			const dir = await createRandomDirectory();
			await dir.create();
			const file = dir.file('test.txt');
			await file.create();
			const content = 'test content';
			await file.write(content);
			expect(await file.text()).toBe(content);
			await deleteRandomDirectory(dir);
		});

		test('read yml file', async () => {
			const dir = await createRandomDirectory();
			await dir.create();
			const file = dir.file('test.yml');
			await file.create();
			const content = 'test: content';
			await file.write(content);
			const json = await file.json();
			expect(json).toStrictEqual({test: 'content'});
			await deleteRandomDirectory(dir);
		});

		test('read json file', async () => {
			const dir = await createRandomDirectory();
			await dir.create();
			const file = dir.file('test.json');
			await file.create();
			const content = '{"test": "content"}';
			await file.write(content);
			const json = await file.json();
			expect(json).toStrictEqual({test: 'content'});
			await deleteRandomDirectory(dir);
		});

		test('read log file', async () => {
			const dir = await createRandomDirectory();
			await dir.create();
			const file = dir.file('test.log');
			await file.create();
			const content = 'test content';
			await file.write(content);
			await expect(file.text()).resolves.toBe(content);
			await deleteRandomDirectory(dir);
		});

		test('write json file', async () => {
			const dir = await createRandomDirectory();
			await dir.create();
			const file = dir.file('test.json');
			await file.create();
			const content = {test: 'content'};
			await file.stringify(content);
			await expect(file.text()).resolves.toBe(JSON.stringify(content));
			await deleteRandomDirectory(dir);
		});

		test('write yml file', async () => {
			const dir = await createRandomDirectory();
			await dir.create();
			const file = dir.file('test.yml');
			await file.create();
			const content = {test: 'content', test2: ['content', 'content2']};
			await file.stringify(content);
			await expect(file.text()).resolves.toBe('test: content\ntest2:\n  - content\n  - content2\n');
			await deleteRandomDirectory(dir);
		});

	});

});