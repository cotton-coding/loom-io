import { expect, test, describe, afterEach } from 'vitest';
import { LoomIO, SourceAdapter, isFile, isList, isDirectory, isEditor, isReader, FileHandler } from './lib.js';
import { List } from '../core/list.js';
import { Editor } from '../core/editor.js';
import { Directory } from '../core/dir.js';
import { LoomFile } from '../core/file.js';


class LoomFsTest extends LoomIO {

	static clean() {
		LoomIO.pluginNonces = [];
	}

	static getPluginHashes() {
		return LoomIO.pluginNonces;
	}
}


describe('Test Entry', () => {

	afterEach(() => {
		LoomFsTest.clean();
	});


	describe.concurrent('Type Check', () => {
		test('isFile definition', () => {
			expect(isFile).toBeDefined();
			expect(isFile({})).toBeFalsy();
		});

		test('isFile and no other', async () => {
			const file = new LoomFile({} as SourceAdapter, {} as Directory, 'test.json');
			expect(isFile(file)).toBeTruthy();
			expect(isList(file)).toBeFalsy();
			expect(isDirectory(file)).toBeFalsy();
			expect(isEditor(file)).toBeFalsy();
			expect(isReader(file)).toBeFalsy();
		});

		test('directory is no file', async () => {
			const dir = new Directory({} as SourceAdapter, 'test://data');
			expect(isFile(dir)).toBeFalsy();
		});

		test('isList definition', () => {
			expect(isList).toBeDefined();
			expect(isList({})).toBeFalsy();
		});

		test('isList and no other', async () => {
			const dir = new Directory({} as SourceAdapter, 'test://data');
			const list = new List(dir, []);
			expect(isList(list)).toBeTruthy();
			expect(isFile(list)).toBeFalsy();
			expect(isDirectory(list)).toBeFalsy();
			expect(isEditor(list)).toBeFalsy();
			expect(isReader(list)).toBeFalsy();
		});


		test('isDirectory definition', () => {
			expect(isDirectory).toBeDefined();
			expect(isDirectory({})).toBeFalsy();
		});

		test('isDirectory no other', async () => {
			const dir = new Directory({} as SourceAdapter, 'test://data');
			expect(isDirectory(dir)).toBeTruthy();
			expect(isFile(dir)).toBeFalsy();
			expect(isList(dir)).toBeFalsy();
			expect(isEditor(dir)).toBeFalsy();
			expect(isReader(dir)).toBeFalsy();
		});

		test('isEditor definition', () => {
			expect(isEditor).toBeDefined();
			expect(isEditor({})).toBeFalsy();
		});

		test('isEditor no other', async () => {
			const file = new LoomFile({} as SourceAdapter, {} as Directory, 'test.json');
			const editor = new Editor(file, {} as FileHandler);
			expect(isEditor(editor)).toBeTruthy();
			expect(isFile(editor)).toBeFalsy();
			expect(isList(editor)).toBeFalsy();
			expect(isDirectory(editor)).toBeFalsy();
			expect(isReader(editor)).toBeTruthy();
		});

		test('isReader definition', () => {
			expect(isReader).toBeDefined();
			expect(isReader({})).toBeFalsy();
		});

		test('editor is reader', async () => {
			const file = new LoomFile({} as SourceAdapter, {} as Directory, 'test.json');
			const editor = new Editor(file, {} as FileHandler);
			expect(isReader(editor)).toBeTruthy();
		});
	});




});