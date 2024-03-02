import { describe, test, expect, beforeAll } from 'vitest';
import * as fs from 'fs/promises';
import type { Dirent } from 'fs';
import { DirentWrapper } from './dirent.js';
import { Directory } from '../dir';
import { TestFilesystemHelper } from '../../../test/helpers/testFilesystemHelper';

describe('Test Dirent Service', () => {

	let dir: Directory;
	let dirent: Dirent;

	beforeAll(async () => {
		const testHelper = TestFilesystemHelper.init();
		(await testHelper).createDir('test');
		dir = new Directory((await testHelper).getBasePath());
		dirent = (await fs.readdir(dir.path, { withFileTypes: true }))[0];
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
		expect(direntWrapper.path).toBe(`${dir.path}/test`);
	});

});