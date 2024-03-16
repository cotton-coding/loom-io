import { MemoryDirectory, MEMORY_TYPE, MemoryRoot } from '../definitions';
import { AlreadyExistsException, NotFoundException } from '../exceptions';
import { Adapter } from './adapter';
import { describe, test, expect, beforeEach } from 'vitest';


class UnwrappedAdapter extends Adapter {

	get _storage() {
		return this.storage;
	}

	setTestStorage() {
		this.storage = {
			$type: MEMORY_TYPE.ROOT,
			content: [{
				$type: MEMORY_TYPE.DIRECTORY,
				name: 'test',
				content: [{
					$type: MEMORY_TYPE.FILE,
					name: 'file',
					ext: 'txt',
					content: Buffer.from('test')
				}]
			}, {
				$type: MEMORY_TYPE.DIRECTORY,
				name: 'cotton-coding',
				content: [{
					$type: MEMORY_TYPE.DIRECTORY,
					name: 'sub-dir',
					content: [{
						$type: MEMORY_TYPE.FILE,
						name: 'file2',
						ext: 'txt',
						content: Buffer.from('test')
					}]
				}, {
					$type: MEMORY_TYPE.DIRECTORY,
					name: 'empty-dir',
					content: []
				}]
			}, {
				$type: MEMORY_TYPE.FILE,
				name: 'file2',
				ext: 'txt',
				content: Buffer.from('test')
			}, {
				$type: MEMORY_TYPE.DIRECTORY,
				name: 'test2',
				content: [{
					$type: MEMORY_TYPE.FILE,
					name: 'file3',
					ext: 'txt',
					content: Buffer.from('test')
				}]
			}]
		};
	}

	createDirectory(name, content?) {
		return super.createDirectory(name, content);
	}

	createFile(name, content?) {
		return super.createFile(name, content);
	}

	compareNameAndType = super.compareNameAndType.bind(this);
	createObjectInRoot = super.createObjectInRoot.bind(this);
	createObject = super.createObject.bind(this);
	getLastPartOfPath = super.getLastPartOfPath.bind(this);
}


describe('Memory Adapter internal functions', async () => {
	let adapter: UnwrappedAdapter;

	beforeEach(async () => {
		adapter = new UnwrappedAdapter();
	});

	test('create empty directory object', async () => {
		const dir = adapter.createDirectory('test');
		expect(dir.$type).toBe(MEMORY_TYPE.DIRECTORY);
		expect(dir.name).toBe('test');
		expect(dir.content).toEqual([]);
	});

	test('create file object', async () => {
		const file = adapter.createFile('file.txt', Buffer.from('test'));
		expect(file.$type).toBe(MEMORY_TYPE.FILE);
		expect(file.name).toBe('file');
		expect(file.ext).toBe('txt');
		expect(file.content).toEqual(Buffer.from('test'));
	});

	test('create empty file object', async () => {
		const file = adapter.createFile('file.txt');
		expect(file.$type).toBe(MEMORY_TYPE.FILE);
		expect(file.name).toBe('file');
		expect(file.ext).toBe('txt');
		expect(file.content.toString('utf-8')).toEqual('');
	});

	test('create directory object with content', async () => {
		const file = adapter.createFile('file.txt', Buffer.from('test'));
		const subDir = adapter.createDirectory('subDir');
		const dir = adapter.createDirectory('test', [file, subDir]);
		expect(dir.$type).toBe(MEMORY_TYPE.DIRECTORY);
		expect(dir.name).toBe('test');
		expect(dir.content).toEqual([file, subDir]);
	});

	test('create directory in root', async () => {
		const dir = adapter.createObjectInRoot('test', MEMORY_TYPE.DIRECTORY);
		expect(adapter._storage.content).toEqual([dir]);
	});

	test('create file in root', async () => {
		const file = adapter.createObjectInRoot('file.txt', MEMORY_TYPE.FILE);
		expect(adapter._storage.content).toEqual([file]);
	});

	test('create multiple objects in root', async () => {
		const file = adapter.createObjectInRoot('file.txt', MEMORY_TYPE.FILE);
		const dir = adapter.createObjectInRoot('test', MEMORY_TYPE.DIRECTORY);
		const dir2 = adapter.createObjectInRoot('test2', MEMORY_TYPE.DIRECTORY);
		expect(adapter._storage.content).toEqual([file, dir, dir2]);
	});

	test('Crate object by filename', () => {
		const file = adapter.createObject('file.txt', MEMORY_TYPE.FILE);
		expect(adapter._storage.content).toEqual([file]);
	});

	test('Crate object by filename with deep path', () => {
		const path = 'test/some/cotton/coding/file.txt';
		const file = adapter.createObject(path, MEMORY_TYPE.FILE);
		expect(adapter._storage.content.length).toBe(1);
		const parts = path.split('/');
		const fileName = parts.pop();
		let ref: MemoryDirectory | MemoryRoot = adapter._storage;
		for(const part of parts) {
			expect(ref.content.length).toBe(1);
			const dir = ref.content[0];
			expect(dir.$type).toBe(MEMORY_TYPE.DIRECTORY);
			expect(dir.name).toBe(part);
			ref = dir;
		}

		expect(ref.content.length).toBe(1);
		expect(ref.content[0]).toBe(file);
		const [name, ext] = fileName!.split('.');
		expect(file.name).toBe(name);
		expect(file.ext).toBe(ext);
	});

	test('Compare name and type for file', () => {
		const file = adapter.createFile('file.txt', Buffer.from('test'));
		expect(adapter.compareNameAndType(file, 'file.txt', MEMORY_TYPE.FILE)).toBe(true);
	});

	test('Compare name and type for directory', () => {
		const dir = adapter.createDirectory('test');
		expect(adapter.compareNameAndType(dir, 'test', MEMORY_TYPE.DIRECTORY)).toBe(true);
	});

	test('Compare name and type for file with unknown type', () => {
		const file = adapter.createFile('file.txt', Buffer.from('test'));
		expect(adapter.compareNameAndType(file, 'file.txt')).toBe(true);
	});

	test('Compare name and type with not matching name', () => {
		const file = adapter.createFile('file.txt', Buffer.from('test'));
		expect(adapter.compareNameAndType(file, 'file2.txt', MEMORY_TYPE.FILE)).toBe(false);
	});

	test('Compare name and type with not matching type', () => {
		const file = adapter.createFile('file.txt', Buffer.from('test'));
		expect(adapter.compareNameAndType(file, 'file.txt', MEMORY_TYPE.DIRECTORY)).toBe(false);
		const dir = adapter.createDirectory('test');
		expect(adapter.compareNameAndType(dir, 'test', MEMORY_TYPE.FILE)).toBe(false);
		expect(adapter.compareNameAndType(dir, 'test')).toBe(true);
		expect(adapter.compareNameAndType(file, 'test')).toBe(false);
	});

	test('get last part of path (file)', () => {
		adapter.setTestStorage();
		const dir = adapter.getLastPartOfPath('test', MEMORY_TYPE.DIRECTORY);
		expect(dir).toBe(adapter._storage.content[0]);
		const file = adapter.getLastPartOfPath('test/file.txt', MEMORY_TYPE.FILE);
		expect(file).toBe(adapter._storage.content[0].content[0]);
	});

	test('get last part of path (directory)', () => {
		adapter.setTestStorage();
		const dir = adapter.getLastPartOfPath('cotton-coding', MEMORY_TYPE.DIRECTORY);
		expect(dir).toBe(adapter._storage.content[1]);
		const file = adapter.getLastPartOfPath('cotton-coding/sub-dir', MEMORY_TYPE.DIRECTORY);
		expect(file).toBe(adapter._storage.content[1].content[0]);
	});

	test('get last part of path (find empty dir)', () => {
		adapter.setTestStorage();
		const dir = adapter.getLastPartOfPath('cotton-coding/empty-dir/', MEMORY_TYPE.DIRECTORY);
		expect(dir).toBe(adapter._storage.content[1].content[1]);
	});

	test('get last part of path (not found with type)', () => {
		adapter.setTestStorage();
		expect(() => adapter.getLastPartOfPath('cotton-coding/sub-dir', MEMORY_TYPE.FILE)).toThrow(NotFoundException);
	});

	test('get last part of path (not found)', () => {
		adapter.setTestStorage();
		expect(() => adapter.getLastPartOfPath('/cotton-coding/sub-dir/file.txt')).toThrow(NotFoundException);
	});


	test('Crate object by filename with deep path and existing directories', () => {
		const path = 'test/some/cotton/coding/file.txt';
		adapter.createObject(path, MEMORY_TYPE.FILE);
		expect(() => adapter.createObject(path, MEMORY_TYPE.FILE)).toThrow(AlreadyExistsException);
		expect(adapter._storage.content.length).toBe(1);

	});
});
