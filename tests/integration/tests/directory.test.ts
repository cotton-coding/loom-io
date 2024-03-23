import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import LoomIO, { Directory, LoomFile } from '@loom-io/core';

import { FilesystemHelper } from '@loom-io/test-utils';


function createDirectory(...path: string[]) {
	return LoomIO.dir(...path);
}

describe('Test Directory Service', () => {
	test('Create Instance and set path', () => {
		const path = 'test-data';
		const dir = createDirectory(path);
		expect(dir).toBeInstanceOf(Directory);
		expect(dir.path).toBe(`${process.cwd()}/${path}`);
	});

	test('exists', async () => {
		const dir = createDirectory('./test-data/');
		const exists = await dir.exists();
		expect(exists).toBeTruthy();
	});

	test('not exists', async () => {
		const dir = createDirectory('./test-data-not-exists');
		const exists = await dir.exists();
		expect(exists).toBeFalsy();
	});

	test('path', () => {
		const testPath = 'test-data';
		const dir = createDirectory(`./${testPath}`);
		expect(dir.path).toBe(`${process.cwd()}/${testPath}`);
	});

	test('parent', () => {
		const dir = createDirectory('./test-data');
		expect(dir.parent).toBeInstanceOf(Directory);
		expect(dir.parent!.path).toBe(`${process.cwd()}`);
	});

	test('parent of root', () => {
		const root = createDirectory('/');
		expect(root.parent).toBe(undefined);
	});

	test('parent of first level after root', () => {
		const dir = createDirectory('/etc');
		expect(dir.parent).toBeDefined();
		expect(dir.parent!.path).toBe('/');
	});

	describe('with generated file', () => {

		let testHelper: FilesystemHelper;

		beforeEach(async () => {
    
			testHelper = await FilesystemHelper.init();
		});

		afterEach(() => {
			testHelper.destroy();
		});

		test('create', async () => {
			const dir = createDirectory(testHelper.getBasePath(), 'to_delete');
			await dir.create();
			const exists = await dir.exists();
			expect(exists).toBeTruthy();
		});

		describe('delete', () => {

			test('create and delete a file non recursive', async () => {
				const dir = createDirectory(testHelper.getBasePath(), 'to_delete');
				await dir.create();
				expect(await dir.exists()).toBeTruthy();
				await dir.delete();
				expect(await dir.exists()).toBeFalsy();
			});

			test('delete a non existing file', async () => {
				const dir = createDirectory(testHelper.getBasePath(), 'to_delete');
				await dir.delete();
				expect(await dir.exists()).toBeFalsy();
			});

			test('try to delete a non existing file with strict mode', async () => {
				const dir = createDirectory(testHelper.getBasePath(), 'to_delete');
				dir.strict();
				await expect(dir.delete()).rejects.toThrow();
			});

			test('delete a non empty directory', async () => {
				const dir = createDirectory(testHelper.getBasePath(), 'to_delete');
				await dir.create();
				await testHelper.createFile('some content', {path: 'to_delete/test.txt'});
				await expect(dir.delete()).rejects.toThrow();
				await expect(dir.exists()).resolves.toBeTruthy();
			});

			test('delete a non empty directory recursive', async () => {
				const dir = createDirectory(testHelper.getBasePath(), 'to_delete');
				await dir.create();
				await testHelper.createFile('some content', {path: 'to_delete/test_some_other'});
				await dir.delete(true);
				expect(await dir.exists()).toBeFalsy();
			});

		});
		describe('list method', () => {

			test('list directory amount', async () => {
				await testHelper.createDir('testDir');
				await testHelper.createDir('testDir2/testDir3');
				await testHelper.createFile('testDir23/testFile.txt');

				const dir = createDirectory(testHelper.getBasePath());
				const files = await dir.list();
				expect(files).toHaveLength(3);

			});

			test('list directory' , async () => {
				const testDir = (await testHelper.createDirs()).includeBasePath().getPaths(1);

				const dir = createDirectory(testHelper.getBasePath());
				const paths = await dir.list();
				for(const t of paths) {
					expect(testDir).toContain((t as Directory).path);
				}
			});

			test('list with subDirectory', async () => {
				const subPath = 'someRandomTestDir';
				const testSubHelper = testHelper.createSubDir(subPath);
				const testDir = (await testSubHelper.createDirs(30)).includeBasePath().getPaths(1);
				await testHelper.createDirs(7);


				const dir = createDirectory(testHelper.getBasePath());
				const paths = await dir.subDir(subPath).list();
				for(const t of paths) {
					expect(testDir).toContain((t as Directory).path);
				}
			});

			// TODO: maybe needed for list.asStringArray();
			// test('list with additional params', async () => {
			// 	await testHelper.createDirs(30);
			// 	await testHelper.createDirs(2);

			// 	const dir = createDirectory(testHelper.getBasePath());
			// 	const paths = await dir.list(undefined, 'isDirectory');
			// 	expect(paths[0]).toHaveLength(2);
			// 	expect(paths[0][0]).toBeTypeOf('string');
			// 	expect(paths[0][1]).toBe(true);
			// });

			// test('list with additional multiple params', async () => {
			// 	await testHelper.createFile('testFile', {path: 'testFile.txt'});

			// 	const dir = createDirectory(testHelper.getBasePath());
			// 	const paths = await dir.list(undefined, 'isDirectory', 'isFile');
			// 	expect(paths[0]).toHaveLength(3);
			// 	expect(paths[0][0]).toBeTypeOf('string');
			// 	expect(paths[0][1]).toBe(false);
			// 	expect(paths[0][2]).toBe(true);
			// });
		});

		describe('files method', () => {
                
			test('files test returned amount', async () => {
				await testHelper.createDirs();
				await testHelper.createFile('lorem-dorem', {path: 'dorem/tt.txt'});
				await testHelper.createFile('lorem', {path: 'tt2.txt'});

				const dir = createDirectory(testHelper.getBasePath());

				const files = await dir.files();
				expect(files).toHaveLength(1);
                
				for(const f of files) {
					expect(f).toBeInstanceOf;
					expect(await (f as LoomFile).text()).toBe('lorem');
				}


			});

			test('get files recursive', async () => {
				await testHelper.createDirs();
				await testHelper.createFile('lorem', {path: 'dorem/tt.txt'});
				await testHelper.createFile('lorem');
				await testHelper.createFile('lorem');

				const dir = createDirectory(testHelper.getBasePath());

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