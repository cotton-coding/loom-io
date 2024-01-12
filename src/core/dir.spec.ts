import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { Directory } from './dir.js';

import { TestFilesystemHelper } from '../../test/helpers/testFilesystemHelper.js';
import { File } from './file.js';

class DirectoryTest extends Directory {

	getPath() {
		return this.path;
	}
}


describe('Test Directory Service', () => {
	test('Create Instance and set path', () => {
		const path = './test/data';
		const dir = new DirectoryTest(path);
		expect(dir).toBeInstanceOf(Directory);
		expect(dir.getPath()).toBe(path);
	});


	describe('with generaed file', () => {

		let testHelper: TestFilesystemHelper;

		beforeEach(async () => {
    
			testHelper = await TestFilesystemHelper.init();
		});

		afterEach(() => {
			testHelper.destroy();
		});


		describe('list methode', () => {

            
			test('list directory amount', async () => {
				await testHelper.createDir('testDir');
				await testHelper.createDir('testDir2/testDir3');
				await testHelper.createFile('testDir23/testFile.txt');

				const dir = new Directory(testHelper.getBasePath());
				const files = await dir.list();
				expect(files).toHaveLength(3);

			});

			test('list directory' , async () => {
				const testDir = (await testHelper.createDirs()).includeBasePath().getPaths(1);

				const dir = new Directory(testHelper.getBasePath());
				const paths = await dir.list();
				for(const t of paths) {
					expect(testDir).toContain((t as Directory).path);
				}
			});

			test('list with subdirectory', async () => {
				const subPath = 'someRandomTestDir';
				const testSubHelper = testHelper.createSubDir(subPath);
				const testDir = (await testSubHelper.createDirs(30)).includeBasePath().getPaths(1);
				await testHelper.createDirs(7);


				const dir = new Directory(testHelper.getBasePath());
				const paths = await dir.subdir(subPath).list();
				for(const t of paths) {
					expect(testDir).toContain((t as Directory).path);
				}
			});

			// TODO: maybe needed for list.asStringArray();
			// test('list with additional params', async () => {
			// 	await testHelper.createDirs(30);
			// 	await testHelper.createDirs(2);

			// 	const dir = new Directory(testHelper.getBasePath());
			// 	const paths = await dir.list(undefined, 'isDirectory');
			// 	expect(paths[0]).toHaveLength(2);
			// 	expect(paths[0][0]).toBeTypeOf('string');
			// 	expect(paths[0][1]).toBe(true);
			// });

			// test('list with additional multiple params', async () => {
			// 	await testHelper.createFile('testFile', {path: 'testFile.txt'});

			// 	const dir = new Directory(testHelper.getBasePath());
			// 	const paths = await dir.list(undefined, 'isDirectory', 'isFile');
			// 	expect(paths[0]).toHaveLength(3);
			// 	expect(paths[0][0]).toBeTypeOf('string');
			// 	expect(paths[0][1]).toBe(false);
			// 	expect(paths[0][2]).toBe(true);
			// });
		});

		describe('files methode', () => {
                
			test('files test returned amount', async () => {
				await testHelper.createDirs();
				await testHelper.createFile('lorem-dorem', {path: 'dorem/tt.txt'});
				await testHelper.createFile('lorem', {path: 'tt2.txt'});

				const dir = new Directory(testHelper.getBasePath());

				const files = await dir.files();
				expect(files).toHaveLength(1);
                
				for(const f of files) {
					expect(f).toBeInstanceOf;
					expect(await (f as File).text()).toBe('lorem');
				}


			});

		});
        

	});
});