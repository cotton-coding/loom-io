import { describe, test, expect, beforeAll } from 'vitest';
import { DirentWrapper } from './dirent.js';
import { Directory } from '../core/dir.js';
import { InMemoryAdapterHelper } from '@loom-io/test-utils';
import { ObjectDirentInterface } from '../definitions.js';

describe('Test Dirent Service', () => {

	let dir: Directory;
	let dirent: ObjectDirentInterface;

	beforeAll(async () => {
		const testHelper = InMemoryAdapterHelper.init();
		testHelper.createDirectory('test');
		const { adapter } = testHelper;
		dir = new Directory(adapter, '/');
		dirent = {
			name: 'test',
			path: '/',
			isDirectory: () => true,
			isFile: () => false
		};
	});

	test('Create Instance and set path', async () => {
		const direntWrapper = new DirentWrapper(dir, dirent);
		expect(direntWrapper).toBeInstanceOf(DirentWrapper);
	});

	test('isDirectory', async () => {
		const direntWrapper = new DirentWrapper(dir, dirent);
		expect(direntWrapper.isDirectory()).toBeTruthy();
	});

	test('isFile', async () => {
		const direntWrapper = new DirentWrapper(dir, dirent);
		expect(direntWrapper.isFile()).toBeFalsy();
	});

	test('dirent', async () => {
		const direntWrapper = new DirentWrapper(dir, dirent);
		expect(direntWrapper.dirent).toBe(dirent);
	});

	test('dir', async () => {
		const direntWrapper = new DirentWrapper(dir, dirent);
		expect(direntWrapper.dir).toBe(dir);
	});

	test('name', async () => {
		const direntWrapper = new DirentWrapper(dir, dirent);
		expect(direntWrapper.name).toBe('test');
	});

	test('parentPath', async () => {
		const direntWrapper = new DirentWrapper(dir, dirent);
		expect(direntWrapper.parentPath).toBe(dir.path);
	});

	test('path', async () => {
		const direntWrapper = new DirentWrapper(dir, dirent);
		expect(direntWrapper.path).toBe(`${dir.path}test`);
	});

});