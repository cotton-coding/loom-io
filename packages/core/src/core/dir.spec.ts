import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { Directory } from './dir.js';
import { join as joinPath } from 'node:path';
import { InMemoryAdapterHelper } from '@loom-io/test-utils';
import { LoomFile } from './file.js';
import { DirectoryNotEmptyException } from '../exceptions.js';
import { addPrecedingSlash, getUniqSegmentsOfPath } from '@loom-io/common';

describe('Test Directory Service', () => {

	let adapter: InMemoryAdapterHelper['adapter'];

	beforeEach(() => {
		const helper = InMemoryAdapterHelper.init();
		adapter = helper.adapter;
	});

	test('path', () => {
		const dir = new Directory(adapter, './test/data');
		expect(dir.path).toBe('test/data');
	});

	test('relativePath', () => {
		const dir = new Directory(adapter, './test/');
		const dir2 = new Directory(adapter, './test/data');
		expect(dir.relativePath(dir2)).toBe('data');
	});

	test('exists', async () => {
		adapter.mkdir('test/data');
		const dir = new Directory(adapter, './test/data/');
		const exists = await dir.exists();
		expect(exists).toBeTruthy();
	});

	test('not exists', async () => {
		const dir = new Directory(adapter, './test/data-not-exists');
		const exists = await dir.exists();
		expect(exists).toBeFalsy();
	});

	test('parent', () => {
		const dir = new Directory(adapter, './test/data');
		expect(dir.parent).toBeInstanceOf(Directory);
		expect(dir.parent!.path).toBe('/test');
	});

	test('parent of root', () => {
		const root = new Directory(adapter, '/');
		expect(root.parent).toBe(undefined);
	});

	test('parent of first level after root', () => {
		const dir = new Directory(adapter, '/etc');
		expect(dir.parent).toBeDefined();
		expect(dir.parent!.path).toBe('/');
	});

	describe('with generated file', () => {

		let adapterHelper: InMemoryAdapterHelper;
		let adapter: InMemoryAdapterHelper['adapter'];

		beforeEach(async () => {
			adapterHelper = await InMemoryAdapterHelper.init();
			adapterHelper.createDirectory();
			adapter = adapterHelper.adapter;
		});

		afterEach(() => {
			adapterHelper.destroy();
		});

		test('create', async () => {

			const dir = new Directory(adapter, adapterHelper.last!, 'to_delete');
			await dir.create();
			await expect(dir.exists()).resolves.toBeTruthy();
		});

		describe('delete', () => {

			test('create and delete a file non recursive', async () => {
				const dir = new Directory(adapter, adapterHelper.last!, 'to_delete');
				await dir.create();
				expect(await dir.exists()).toBeTruthy();
				await dir.delete();
				expect(await dir.exists()).toBeFalsy();
			});

			test('delete a non existing file', async () => {
				const dir = new Directory(adapter, adapterHelper.last!, 'to_delete');
				await dir.delete();
				expect(await dir.exists()).toBeFalsy();
			});

			test('try to delete a non existing dir in strict mode', async () => {
				const dir = new Directory(adapter, adapterHelper.last!, 'to_delete');
				dir.strict();
				await expect(dir.delete()).rejects.toThrow();
			});

			test('delete a non empty directory', async () => {
				const dir = new Directory(adapter, adapterHelper.last!, 'to_delete');
				await dir.create();
				await expect(dir.exists()).resolves.toBeTruthy();
				await adapterHelper.createFile(joinPath(adapterHelper.last!, 'to_delete/cotton.txt'));
				await expect(dir.delete()).rejects.toThrow(DirectoryNotEmptyException);
				await expect(dir.exists()).resolves.toBeTruthy();
			});

			test('delete a non empty directory recursive', async () => {
				const dir = new Directory(adapter, adapterHelper.last!, 'to_delete');
				await dir.create();
				await adapterHelper.createFile(joinPath(adapterHelper.last!, 'to_delete/test_some_other'));
				await dir.delete(true);
				await expect(dir.exists()).resolves.toBeFalsy();
			});

		});
		describe('list method', () => {

			test('list directory amount', async () => {
				const base = adapterHelper.last!;
				await adapterHelper.createDirectory(joinPath(base, 'testDir1'));
				await adapterHelper.createDirectory(joinPath(base, 'testDir2/testDir3'));
				await adapterHelper.createFile(joinPath(base, 'testDir23/testFile.txt'));

				const dir = new Directory(adapter, base);
				const files = await dir.list();
				expect(files).toHaveLength(3);

			});

			test('list directory' , async () => {
				const testDir = adapterHelper.createMultipleDirectories(100);
				const listOfUniques = getUniqSegmentsOfPath(testDir, 1);
				const dir = new Directory(adapter, '/');
				const paths = await dir.list();
				for(const t of paths) {
					expect(listOfUniques).toContain((t as Directory).path);
				}
			});

			test('list with subDirectory', async () => {
				const subPath = 'someRandomTestDir';
				const testPaths = await adapterHelper.createMultipleDirectories(7, subPath);
				const testDir = getUniqSegmentsOfPath(testPaths, 2).map(p => addPrecedingSlash(p));


				const dir = new Directory(adapter, '/');
				const paths = await dir.subDir(subPath).list();
				for(const t of paths) {
					expect(testDir).toContain((t as Directory).path);
				}
			});

			// TODO: maybe needed for list.asStringArray();
			// test('list with additional params', async () => {
			// 	await testHelper.createDirs(30);
			// 	await testHelper.createDirs(2);

			// 	const dir = new Directory(adapter, testHelper.getBasePath());
			// 	const paths = await dir.list(undefined, 'isDirectory');
			// 	expect(paths[0]).toHaveLength(2);
			// 	expect(paths[0][0]).toBeTypeOf('string');
			// 	expect(paths[0][1]).toBe(true);
			// });

			// test('list with additional multiple params', async () => {
			// 	await testHelper.createFile('testFile', {path: 'testFile.txt'});

			// 	const dir = new Directory(adapter, testHelper.getBasePath());
			// 	const paths = await dir.list(undefined, 'isDirectory', 'isFile');
			// 	expect(paths[0]).toHaveLength(3);
			// 	expect(paths[0][0]).toBeTypeOf('string');
			// 	expect(paths[0][1]).toBe(false);
			// 	expect(paths[0][2]).toBe(true);
			// });
		});

		describe('files method', () => {

			test('files test returned amount', async () => {
				await adapterHelper.createMultipleDirectories();
				await adapterHelper.createFile('dorem/tt.txt', 'lorem-dorem');
				await adapterHelper.createFile('tt2.txt', 'lorem');

				const dir = new Directory(adapter, '/');

				const files = await dir.files();
				expect(files).toHaveLength(1);

				for(const f of files) {
					expect(f).toBeInstanceOf;
					expect(await (f as LoomFile).text()).toBe('lorem');
				}


			});

			test('get files recursive', async () => {
				await adapterHelper.createMultipleDirectories();
				await adapterHelper.createFile('dorem/tt.txt', 'lorem');
				await adapterHelper.createFile('random/path/to/cotton/coding/lorem.txt', 'lorem');
				await adapterHelper.createFile('more/lorem.txt', 'lorem');

				const dir = new Directory(adapter, '/');

				const files = await dir.files(true);
				expect(files).toHaveLength(3);

				for(const f of files) {
					expect(f).toBeInstanceOf;
					expect(await (f as LoomFile).text()).toBe('lorem');
				}
			});

		});


	});
});