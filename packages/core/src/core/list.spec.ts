import { expect, describe, test, beforeEach, afterEach } from 'vitest';
import { List } from './list.js';
import { Directory } from './dir.js';
import { LoomFile } from './file.js';
import { InMemoryAdapterHelper } from '@loom-io/test-utils';
import { getUniqSegmentsOfPath, removePrecedingSlash } from '@loom-io/common';

class RevealedList extends List {

	constructor(list?: List) {
		super();
		if(list){
			this.add(list);
		}
	}

	getWraps() {
		return this._dirent;
	}

	revealedAdd(...params: unknown[]) {
		const _params = params as Parameters<List['add']>;
		return this.add(..._params);
	}
}

describe('Test List', () => {


	let adapterHelper: InMemoryAdapterHelper;
	let adapter: InMemoryAdapterHelper['adapter'];

	beforeEach(async () => {
		adapterHelper = InMemoryAdapterHelper.init();
		adapterHelper.createDirectory('test/data');

		adapter = adapterHelper.adapter;
	});

	afterEach(async () => {
		await adapterHelper.destroy();
	});


	describe('Constructor, add and concat', () => {

		test('Create Instance', () => {
			const list = new List();
			expect(list).toBeInstanceOf(List);
		});

		test('Create Instance with DirentWrapper', async () => {
			const dir = new Directory(adapter, './test/data');
			const list = await dir.list();
			const revealedList = new RevealedList(list);
			expect(list).toBeInstanceOf(List);
			const paths = revealedList.getWraps();
			const newList = List.from(paths);
			expect(newList).toBeInstanceOf(List);
		});

		test('Create Instance with Directory', async () => {
			const dir = new Directory(adapter, './test/data');
			const list = await dir.list();
			const revealedList = new RevealedList(list);
			expect(list).toBeInstanceOf(List);
			const paths = revealedList.getWraps().map((wrap) => wrap.dirent);
			const newList = new List(dir, paths);
			expect(newList).toBeInstanceOf(List);
		});



		test('Concat Lists', async () => {

			await adapterHelper.createFile('testDir/testFile.txt');
			const base1 = 'cotton';
			const base2 = 'wool';

			const testPaths1 = adapterHelper.createMultipleDirectories(7, base1);
			const testPaths2 = adapterHelper.createMultipleDirectories(13, base2);

			const basePaths1 = Array.from(new Set(testPaths1.map((path) => removePrecedingSlash(path).split('/').splice(1, 1)).flat()));
			const basePaths2 = Array.from(new Set(testPaths2.map((path) => removePrecedingSlash(path).split('/').splice(1, 1)).flat()));

			const dir1 = new Directory(adapter, base1);
			const dir2 = new Directory(adapter, base2);
			const list1 = await dir1.list();

			expect(list1).toBeInstanceOf(List);
			expect(list1).toHaveLength(basePaths1.length);

			const list2 = await dir2.list();

			expect(list2).toBeInstanceOf(List);
			expect(list2).toHaveLength(basePaths2.length);

			const list = list1.concat(list2);

			expect(list).toBeInstanceOf(List);
			expect(list).toHaveLength(basePaths1.length + basePaths2.length);
		});

	});

	describe('Filter', () => {

		beforeEach(async () => {
			adapterHelper = InMemoryAdapterHelper.init();
			adapter = adapterHelper.adapter;
		});

		afterEach(async () => {
			await adapterHelper.destroy();
		});

		test('Filter function', async () => {
			await adapterHelper.createDirectory('testDir');
			await adapterHelper.createMultipleDirectories();
			await adapterHelper.createFile('testFile.txt');

			// TODO: Handle '/' and './' and '.'
			const dir = new Directory(adapter, '/');
			const list = await dir.list();
			const filtered = list.filter((wrap) => wrap.name === 'testDir');
			expect(filtered).toBeInstanceOf(List);
			expect(filtered).toHaveLength(1);

		});

		test('filter function with subDir', async () => {
			const subDirName = 'testDir';
			adapterHelper.createDirectory(subDirName);
			adapterHelper.createFile(`${subDirName}/some.log`, 'lorem');
			adapterHelper.createMultipleDirectories();
			adapterHelper.createFile('testFile.txt');

			const dir = new Directory(adapter, '/');
			const list = await dir.list();
			const filtered = list.filter((wrap) => wrap.name === subDirName);
			expect(filtered).toBeInstanceOf(List);
			expect(filtered).toHaveLength(1);

			expect(filtered.first()).toBeInstanceOf(Directory);
			const file = (await filtered.first<Directory>().list()).first();

			expect(file).toBeInstanceOf(LoomFile);

		});

		test('filterByDirent directory', async () => {
			await adapterHelper.createDirectory('testDir');
			await adapterHelper.createMultipleDirectories();
			await adapterHelper.createFile('testFile.txt');

			const dir = new Directory(adapter, '/');
			const list = await dir.list();
			const filtered = list.filterByType('isDirectory');
			expect(filtered).toBeInstanceOf(List);

			for(const dir of filtered) {
				expect(dir).toBeInstanceOf(Directory);
			}

		});

		test('filterByDirent file', async () => {
			await adapterHelper.createDirectory('testDir');
			await adapterHelper.createMultipleDirectories();
			await adapterHelper.createFile('some.log', 'lorem');
			await adapterHelper.createFile('some.ltest', 'lorems');
			await adapterHelper.createFile();
			await adapterHelper.createFile();


			const dir = new Directory(adapter, '/');
			const list = await dir.list();
			const filtered = list.filterByType('isFile');
			expect(filtered).toBeInstanceOf(List);

			for(const file of filtered) {
				expect(file).toBeInstanceOf(LoomFile);
			}

		});

	});

	describe('Iterator', () => {

		beforeEach(async () => {
			adapterHelper = InMemoryAdapterHelper.init();
			adapter = adapterHelper.adapter;
		});

		afterEach(async () => {
			await adapterHelper.destroy();
		});

		test('Iterate over list', async () => {
			await adapterHelper.createDirectory('testDir');
			const paths = adapterHelper.createMultipleDirectories();

			const amount = getUniqSegmentsOfPath(paths, 1).length;
			await adapterHelper.createFile('some.log', 'lorem');

			const total = amount + 2;

			const dir = new Directory(adapter, '/');
			const list = await dir.list();
			expect(list).toHaveLength(total);

			let count = 0;
			for(const el of list) {
				expect(el).toBeDefined();
				if(!(el instanceof Directory || el instanceof LoomFile)) {
					throw new Error('Element is not a Directory or File');
				}
				count++;
			}
			expect(count).toBe(total);

		});
	});

	describe('Getters', () => {

		beforeEach(async () => {
			adapterHelper = InMemoryAdapterHelper.init();
			adapter = adapterHelper.adapter;
		});

		afterEach(async () => {
			await adapterHelper.destroy();
		});

		test('Get length', async () => {
			await adapterHelper.createDirectory('testDir');
			const paths = await adapterHelper.createMultipleDirectories();
			const amount = getUniqSegmentsOfPath(paths, 1).length;
			await adapterHelper.createFile('some.log', 'lorem');

			const total = amount + 2;

			const dir = new Directory(adapter, '/');
			const list = await dir.list();
			expect(list).toHaveLength(total);
		});

		test('Get first', async () => {
			await adapterHelper.createDirectory('testDir');
			const paths = await adapterHelper.createMultipleDirectories();
			const amount = getUniqSegmentsOfPath(paths, 1).length;
			await adapterHelper.createFile('some.log', 'lorem');

			const total = amount + 2;

			const dir = new Directory(adapter, '/');
			const list = await dir.list();
			expect(list).toHaveLength(total);

			const first = list.first();
			const zero = list.at(0);
			expect(first).toBeDefined();
			expect(first instanceof Directory || first instanceof LoomFile).toBeTruthy();
			expect(first.path).toBe(zero.path);
		});

		test('Get last', async () => {
			await adapterHelper.createDirectory('testDir');
			const paths = await adapterHelper.createMultipleDirectories();
			const amount = getUniqSegmentsOfPath(paths, 1).length;
			await adapterHelper.createFile('some.log', 'lorem');

			const total = amount + 2;

			const dir = new Directory(adapter, '/');
			const list = await dir.list();
			expect(list).toHaveLength(total);

			const last = list.last();
			const zero = list.at(total - 1);
			expect(last).toBeDefined();
			expect(last instanceof Directory || last instanceof LoomFile).toBeTruthy();
			expect(last.path).toBe(zero.path);
		});
	});

	describe('protected functions', () => {

		test('Add DirentWrapper', async () => {
			const dir = new Directory(adapter, './test/data');
			const list = await dir.list();
			const revealedList = new RevealedList(list);
			const paths = revealedList.getWraps();
			const newList = new RevealedList();
			newList.revealedAdd(paths);
			expect(newList).toBeInstanceOf(List);
		});

		test('Add List', async () => {
			const dir = new Directory(adapter, './test/data');
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

	describe('test symbols', () => {

		test('toStringTag', () => {
			const list = new List();
			expect(Object.prototype.toString.call(list)).toBe('[object LoomList]');
		});
	});
});
