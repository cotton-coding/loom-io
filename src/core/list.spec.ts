import { expect, describe, test, beforeEach, afterEach } from 'vitest';
import { List } from './list';
import { Directory } from './dir';
import { File } from './file';
import { TestFilesystemHelper } from '../../test/helpers/testFilesystemHelper';

class RevealedList extends List {
	
	constructor(list?: List) {
		super();
		if(list){
			this.add(list);
		}
	}

	getWraps() {
		return this.dirWrap;
	}

	revealedAdd(...params: unknown[]) {
		const _params = params as Parameters<List['add']>;
		return this.add(..._params);
	}
}

describe('Test List', () => {


	let testHelper: TestFilesystemHelper;

	beforeEach(async () => {
		testHelper = await TestFilesystemHelper.init();
	});

	afterEach(async () => {
		await testHelper.destroy();
	});


	describe('Constructor, add and concat', () => {

		test('Create Instance', () => {
			const list = new List();
			expect(list).toBeInstanceOf(List);
		});

		test('Create Instance with DirentWrapper', async () => {
			const dir = new Directory('./test/data');
			const list = await dir.list();
			const revealedList = new RevealedList(list);
			expect(list).toBeInstanceOf(List);
			const paths = revealedList.getWraps();
			const newList = List.from(paths);
			expect(newList).toBeInstanceOf(List);
		});

		test('Create Instance with Directory', async () => {
			const dir = new Directory('./test/data');
			const list = await dir.list();
			const revealedList = new RevealedList(list);
			expect(list).toBeInstanceOf(List);
			const paths = revealedList.getWraps().map((wrap) => wrap.dirent);
			const newList = new List(dir, paths);
			expect(newList).toBeInstanceOf(List);
		});



		test('Concat Lists', async () => {

			await testHelper.createFile('testDir/testFile.txt');
			const testSub1 = await testHelper.createSubDir('testDir1');
			const testSub2 = await testHelper.createSubDir('testDir2');

			const testPaths1 = (await testSub1.createDirs(7)).getPaths(1);
			const testPaths2 = (await testSub2.createDirs(13)).getPaths(1);

			const dir1 = new Directory(testSub1.getBasePath());
			const dir2 = new Directory(testSub2.getBasePath());
			const list1 = await dir1.list();

			expect(list1).toBeInstanceOf(List);
			expect(list1).toHaveLength(testPaths1.length);

			const list2 = await dir2.list();

			expect(list2).toBeInstanceOf(List);
			expect(list2).toHaveLength(testPaths2.length);

			const list = list1.concat(list2);

			expect(list).toBeInstanceOf(List);
			expect(list).toHaveLength(testPaths1.length + testPaths2.length);
		});

	});

	describe('Filter', () => {

		test('Filter function', async () => {
			await testHelper.createDir('testDir');
			await testHelper.createDirs();
			await testHelper.createFile('testFile.txt');

			const dir = new Directory(testHelper.getBasePath());
			const list = await dir.list();
			const filtered = list.filter((wrap) => wrap.name === 'testDir');
			expect(filtered).toBeInstanceOf(List);
			expect(filtered).toHaveLength(1);

		});

		test('filter function with subDir', async () => {
			const subDirName = 'testDir';
			const testSub = await testHelper.createSubDir(subDirName);
			await testSub.createFile('lorem', {path: 'some.log'});
			await testHelper.createDirs();
			await testHelper.createFile('testFile.txt');

			const dir = new Directory(testHelper.getBasePath());
			const list = await dir.list();
			const filtered = list.filter((wrap) => wrap.name === subDirName);
			expect(filtered).toBeInstanceOf(List);
			expect(filtered).toHaveLength(1);

			expect(filtered.first()).toBeInstanceOf(Directory);
			const file = (await filtered.first<Directory>().list()).first();
			
			expect(file).toBeInstanceOf(File);

		});

		test('filterByDirent directory', async () => {
			await testHelper.createDir('testDir');
			await testHelper.createDirs();
			await testHelper.createFile('testFile.txt');

			const dir = new Directory(testHelper.getBasePath());
			const list = await dir.list();
			const filtered = list.filterByType('isDirectory');
			expect(filtered).toBeInstanceOf(List);
			
			for(const dir of filtered) {
				expect(dir).toBeInstanceOf(Directory);
			}

		});

		test('filterByDirent file', async () => {
			await testHelper.createDir('testDir');
			await testHelper.createDirs();
			await testHelper.createFile('lorem', {path: 'some.log'});
			await testHelper.createFile('lorems', {path: 'some.ltest'});
			await testHelper.createFile();
			await testHelper.createFile();


			const dir = new Directory(testHelper.getBasePath());
			const list = await dir.list();
			const filtered = list.filterByType('isFile');
			expect(filtered).toBeInstanceOf(List);
			
			for(const file of filtered) {
				expect(file).toBeInstanceOf(File);
			}

		});

	});

	describe('Iterator', () => {
		
		test('Iterate over list', async () => {
			await testHelper.createDir('testDir');
			const amount = (await testHelper.createDirs()).getPaths(1).length;
			await testHelper.createFile('lorem', {path: 'some.log'});

			const total = amount + 2;

			const dir = new Directory(testHelper.getBasePath());
			const list = await dir.list();
			expect(list).toHaveLength(total);

			let count = 0;
			for(const el of list) {
				expect(el).toBeDefined();
				if(!(el instanceof Directory || el instanceof File)) {
					throw new Error('Element is not a Directory or File');
				}
				count++;
			}
			expect(count).toBe(total);

		});
	});

	describe('Getters', () => {
		test('Get length', async () => {
			await testHelper.createDir('testDir');
			const amount = (await testHelper.createDirs()).getPaths(1).length;
			await testHelper.createFile('lorem', {path: 'some.log'});

			const total = amount + 2;

			const dir = new Directory(testHelper.getBasePath());
			const list = await dir.list();
			expect(list).toHaveLength(total);
		});

		test('Get first', async () => {
			await testHelper.createDir('testDir');
			const amount = (await testHelper.createDirs()).getPaths(1).length;
			await testHelper.createFile('lorem', {path: 'some.log'});

			const total = amount + 2;

			const dir = new Directory(testHelper.getBasePath());
			const list = await dir.list();
			expect(list).toHaveLength(total);

			const first = list.first();
			const zero = list.at(0);
			expect(first).toBeDefined();
			expect(first instanceof Directory || first instanceof File).toBeTruthy();
			expect(first.path).toBe(zero.path);
		});

		test('Get last', async () => {
			await testHelper.createDir('testDir');
			const amount = (await testHelper.createDirs()).getPaths(1).length;
			await testHelper.createFile('lorem', {path: 'some.log'});

			const total = amount + 2;

			const dir = new Directory(testHelper.getBasePath());
			const list = await dir.list();
			expect(list).toHaveLength(total);

			const last = list.last();
			const zero = list.at(total - 1);
			expect(last).toBeDefined();
			expect(last instanceof Directory || last instanceof File).toBeTruthy();
			expect(last.path).toBe(zero.path);
		});
	});

	describe('protected functions', () => {

		test('Add DirentWrapper', async () => {
			const dir = new Directory('./test/data');
			const list = await dir.list();
			const revealedList = new RevealedList(list);
			const paths = revealedList.getWraps();
			const newList = new RevealedList();
			newList.revealedAdd(paths);
			expect(newList).toBeInstanceOf(List);
		});

		test('Add Directory and paths', async () => {
			const dir = new Directory('./test/data');
			const list = await dir.list();
			const revealedList = new RevealedList(list);
			const paths = revealedList.getWraps().map((wrap) => wrap.dirent);
			const newList = new RevealedList();
			newList.revealedAdd(dir, paths);
			expect(newList).toBeInstanceOf(List);
			expect(newList).not.toBe(list);

			const newListArray = newList.asArray();
			const listArray = list.asArray();
			expect(newListArray).toHaveLength(listArray.length);
			expect(newListArray).toStrictEqual(listArray);
		});

		test('Add List', async () => {
			const dir = new Directory('./test/data');
			const list = await dir.list();
			const revealedList = new RevealedList(list);
			const newList = new RevealedList();
			newList.revealedAdd(revealedList);
			expect(newList).toBeInstanceOf(List);
			expect(newList).not.toBe(list);

			const newListArray = newList.asArray();
			const listArray = list.asArray();
			expect(newListArray).toHaveLength(listArray.length);
			expect(newListArray).toStrictEqual(listArray);
		});

	});
});
