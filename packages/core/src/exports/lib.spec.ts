import { expect, test, describe, afterEach, vi } from 'vitest';
import { LoomIO, LoomSourceAdapter, NoSourceAdapterException, PLUGIN_TYPE, SourceAdapter, isFile, isList, isDirectory, isEditor, isReader, FileHandler } from './lib.js';
import { List } from '../core/list.js';
import { Editor } from '../core/editor.js';
import { Directory } from '../core/dir.js';
import { LoomFile } from '../core/file.js';


class LoomFsTest extends LoomIO {

	static clean() {
		LoomIO.pluginHashes = [];
		LoomIO.sourceAdapters = [];
	}

	static getPluginHashes() {
		return LoomIO.pluginHashes;
	}
}

const mockSourceAdapter =
	vi.fn((link: string, Type: typeof Directory | typeof LoomFile) => {
		if(link.startsWith('test://')) {
			const adapter = {} as SourceAdapter;
			if(Type === Directory) {
				return new Directory(adapter, link);
			} else if(Type === LoomFile) {
				const dir = new Directory(adapter, link);
				return new LoomFile(adapter, dir, link);
			}
		}
	}) as LoomSourceAdapter['source'];

const sourceAdapter: LoomSourceAdapter = {
	$type: PLUGIN_TYPE.SOURCE_ADAPTER,
	source: mockSourceAdapter
};

describe('Test Entry', () => {

	afterEach(() => {
		LoomFsTest.clean();
	});

	test('Has Statics to create Dir and Files', () => {
		expect(LoomIO).toBeDefined();
		expect(LoomIO.dir).toBeDefined();
		expect(LoomIO.file).toBeDefined();
	});

	test('Register Plugins', () => {
		const pluginHashes = LoomFsTest.getPluginHashes();
		expect(pluginHashes).toHaveLength(0);
	});

	test('Register Plugins only once', () => {
		const pluginHashes = LoomFsTest.getPluginHashes();
		expect(pluginHashes).toHaveLength(0);
		LoomIO.register(sourceAdapter);
		expect(pluginHashes).toHaveLength(1);
		LoomIO.register(sourceAdapter);
		expect(pluginHashes).toHaveLength(1);
	});

	test('Get Dir Instance', async () => {
		LoomIO.register(sourceAdapter);
		const dir = await LoomIO.dir('test://test');
		expect(dir).toBeDefined();
		expect(dir).toBeInstanceOf(Directory);
	});

	test('Get File Instance', async () => {
		LoomIO.register(sourceAdapter);
		const file = await LoomIO.file('test://data/test.json');
		expect(file).toBeDefined();
		expect(file).toBeInstanceOf(LoomFile);
	});

	test('No Source Adapter found', async () => {
		LoomIO.register(sourceAdapter);
		await expect(LoomIO.dir('http://test.com/dir')).rejects.toThrowError(NoSourceAdapterException);
		await expect(LoomIO.file('http://test.com/file.txt')).rejects.toThrowError(NoSourceAdapterException);
		await expect(LoomIO.source('http://test.com')).rejects.toThrowError(NoSourceAdapterException);
	});

	test('No Source Adapter registered', async () => {
		await expect(LoomIO.dir('test://data')).rejects.toThrowError(NoSourceAdapterException);
		await expect(LoomIO.file('test://data/test.json')).rejects.toThrowError(NoSourceAdapterException);
		await expect(LoomIO.source('test://data')).rejects.toThrowError(NoSourceAdapterException);
	});

	describe.concurrent('Type Check', () => {
		test('isFile definition', () => {
			expect(isFile).toBeDefined();
			expect(isFile({})).toBeFalsy();
		});

		test('isFile and no other', async () => {
			LoomIO.register(sourceAdapter);
			const file = await LoomIO.file('test://data/test.json');
			expect(isFile(file)).toBeTruthy();
			expect(isList(file)).toBeFalsy();
			expect(isDirectory(file)).toBeFalsy();
			expect(isEditor(file)).toBeFalsy();
			expect(isReader(file)).toBeFalsy();
		});

		test('directory is no file', async () => {
			LoomIO.register(sourceAdapter);
			const dir = await LoomIO.dir('test://data');
			expect(isFile(dir)).toBeFalsy();
		});

		test('isList definition', () => {
			expect(isList).toBeDefined();
			expect(isList({})).toBeFalsy();
		});

		test('isList and no other', async () => {
			LoomIO.register(sourceAdapter);
			const dir = await LoomIO.dir('test://');
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
			LoomIO.register(sourceAdapter);
			const dir = await LoomIO.dir('test://data');
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
			LoomIO.register(sourceAdapter);
			const file = await LoomIO.file('test://data/test.json');
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
			LoomIO.register(sourceAdapter);
			const file = await LoomIO.file('test://data/test.json');
			const editor = new Editor(file, {} as FileHandler);
			expect(isReader(editor)).toBeTruthy();
		});
	});




});