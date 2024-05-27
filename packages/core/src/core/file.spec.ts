import { vi, expect, test, describe, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { LoomFile } from './file.js';
import { FileConvertException } from '../exceptions.js';
import { InMemoryAdapterHelper } from '@loom-io/test-utils';

import { basename, dirname } from 'node:path';
import { Directory } from './dir.js';
import { FILE_SIZE_UNIT, LoomFileConverter, PLUGIN_TYPE, SourceAdapter } from '../definitions.js';
import { faker } from '@faker-js/faker';
import { Editor } from './editor.js';

class FileTest extends LoomFile {

	constructor(adapter: SourceAdapter, path: string){
		const dir = new Directory(adapter, dirname(path));
		super(adapter, dir, basename(path));
	}

	static getConvertPlugins() {
		return Array.from(new Set(LoomFile.converterPlugins.values()));
	}

	static emptyPlugins() {
		LoomFile.converterPlugins = [];
	}
	getConverterPlugin() {
		return super.getConverterPlugin();
	}
}

const plugin: LoomFileConverter = {
	$type: PLUGIN_TYPE.FILE_CONVERTER,
	verify: (file: LoomFile) => file.extension === 'json',
	parse: async <T>(file: LoomFile) => JSON.parse(await file.text()) as T,
	stringify: async (file: LoomFile, content: unknown) => await file.write(JSON.stringify(content)),
	nonce: Symbol('json-converter')
};

describe('Test File Service', () => {

	let testHelper: InMemoryAdapterHelper;
	let adapter: InMemoryAdapterHelper['adapter'];

	afterAll(() => {
		FileTest.emptyPlugins();
	});

	beforeEach(async () => {
		testHelper = await InMemoryAdapterHelper.init();
		await testHelper.createDirectory('test/data');
		await testHelper.createFile('test/data/test.json', JSON.stringify({test: true}));
		adapter = testHelper.adapter;
	});


	test('Create Instance and set path', () => {
		const path = 'test/data/test.txt';
		const file = LoomFile.from(adapter, path);
		expect(file).toBeInstanceOf(LoomFile);
		expect(file.path).toBe(`${path}`);
	});

	test('Get file size', async () => {
		const path = 'test/data/test.txt';
		const content = faker.lorem.words(10000);
		const testFilePath = testHelper.createFile(path, content);
		const file = LoomFile.from(adapter, testFilePath);
		const bytes = await file.getSize(FILE_SIZE_UNIT.BYTE);
		expect(bytes).toBe(content.length);
		const megaBytes = await file.getSize(FILE_SIZE_UNIT.MEGABYTE);
		expect(megaBytes).toBe(content.length / 1024 / 1024);
		const yottaBytes = await file.getSize(FILE_SIZE_UNIT.YOTTABYTE);
		expect(yottaBytes).toBe(content.length / 1024 / 1024 / 1024 / 1024 / 1024 / 1024 / 1024 / 1024);
		const gigaByte = await file.getSize(FILE_SIZE_UNIT.GIGABYTE);
		expect(gigaByte).toBe(content.length / 1024 / 1024 / 1024);
		testHelper.destroy();
	});

	test('If File exists on Object', async () => {
		const file = LoomFile.from(adapter, './test/data/test.json');
		await expect(file.exists()).resolves.toBeTruthy();
	});
	test('If File exists on Object does not exists', async () => {
		const file = LoomFile.from(adapter, './test/data/notexists.json');
		await expect(file.exists()).resolves.toBeFalsy();
	});

	test('Register plugins', async () => {
		const plugins = FileTest.getConvertPlugins();
		expect(plugins).toHaveLength(0);
	});

	test('get parent or dir', () => {
		const file = LoomFile.from( adapter, './test/data/test.json');
		expect(file.dir).instanceOf(Directory);
		expect(file.dir.path).toBe('test/data');
		expect(file.dir).toBe(file.parent);
	});

	test('get reader object', async () => {
		const file = LoomFile.from( adapter, './test/data/test.json');
		const reader = await file.reader();
		expect(reader).toBeDefined();
		expect(reader).toBeInstanceOf(Editor);
		reader.close();
	});

	describe('Test meta data', () => {
		test('Get extension', () => {
			const file = LoomFile.from( adapter, './test/data/test.json');
			expect(file.extension).toBe('json');
		});

		test('Get extension with no extension', () => {
			const file = LoomFile.from( adapter, './test/data/test');
			expect(file.extension).toBe(undefined);
		});

		test('Get File Name', () => {
			const file = LoomFile.from( adapter, './test/data/test.json');
			expect(file.name).toBe('test.json');
		});

	});

	describe('Test with generated file', () => {

		beforeEach(async () => {
			testHelper = await InMemoryAdapterHelper.init();
			adapter = testHelper.adapter;
		});

		afterEach(async () => {
			await testHelper.destroy();
		});

		test('Read text file', async () => {
			const contentToWrite = faker.lorem.words(1000);
			const testFile = testHelper.createFile('someTestFile/file.txt', contentToWrite);
			const file = LoomFile.from( adapter, testFile);
			const content = await file.text();
			expect(content).toBe(contentToWrite);
		});

		test.each(['json', 'yaml', 'yml', 'log', 'txt'])('Get extension %s', async (extension) => {
			const testFile = testHelper.createFile(faker.system.commonFileName(extension), 'test');
			const file = LoomFile.from( adapter, testFile);
			expect(file.extension).toBe(extension);

		});

		test.todo('Read json file', async () => {
			const testContent = {test: true};
			const testFile = await testHelper.createFile(faker.system.commonFileName('json'), JSON.stringify(testContent));

			const file = LoomFile.from( adapter, testFile);
			const content = await file.json();
			expect(content).toStrictEqual(testContent);
		});

		test('Read file plain', async () => {
			const testContent = '1234k2hk3jh1fasdasfc%';
			const testFile = await testHelper.createFile(undefined, testContent);

			const file = LoomFile.from( adapter, testFile);
			const content = await file.plain();
			expect(content).toBeInstanceOf(Buffer);
			expect(content.toString()).toBe(testContent);
		});

		test('Write file', async () => {
			const testContent = '1234k2hk3jh1fasdasfc%';
			const testFile = await testHelper.createFile(undefined, testContent);

			const file = LoomFile.from( adapter, testFile);
			const newContent = 'new content';
			await file.write(newContent);
			const content = await file.text();
			expect(content).toBe(newContent);
		});

		test('Create file', async () => {
			const testFile = await testHelper.createFile(undefined, 'test');
			const file = LoomFile.from( adapter, testFile);
			await file.create();
			expect(await file.exists()).toBeTruthy();
		});

		test('Copy file into file', async () => {
			const testFile = await testHelper.createFile(undefined, 'test');
			const file = LoomFile.from( adapter, testFile);
			await file.create();
			await file.write('new content');
			const newFile = new LoomFile(adapter, file.dir, 'newFile.txt');
			await file.copyTo(newFile);
			expect(await newFile.exists()).toBeTruthy();
		});

		test('Copy file into directory', async () => {
			const testFile = await testHelper.createFile(undefined, 'test');
			const file = LoomFile.from( adapter, testFile);
			await file.create();
			await file.write('new content');
			const newDir = new Directory(adapter, 'newDir');
			await newDir.create();
			const newFile = await file.copyTo(newDir);
			expect(await newFile.exists()).toBeTruthy();
			expect(newFile.name).toBe(file.name);
			expect(newFile.text()).resolves.toBe('new content');
		});

		test('Delete file', async () => {
			const testFile = await testHelper.createFile(undefined, 'test');
			const file = LoomFile.from( adapter, testFile);
			await file.delete();
			expect(await file.exists()).toBeFalsy();
		});

	});


	describe('File Plugin Tests', () => {

		afterEach(() => {
			FileTest.emptyPlugins();
		});

		test('Register a plugin', async () => {
			const testContent = '1234k2hk3jh1fasdasfc%';
			const testFile = await testHelper.createFile(undefined, testContent);

			const file = LoomFile.from( adapter, testFile);
			LoomFile.register(plugin);
			const content = await file.text();
			expect(content).toBe(testContent);
		});

		test('Read file with json plugin', async () => {
			const testContent = {test: true};
			const testFile = await testHelper.createFile(faker.system.commonFileName('json'), JSON.stringify(testContent));

			const file = LoomFile.from( adapter, testFile);
			LoomFile.register(plugin);
			const content = await file.json();
			expect(content).toStrictEqual(testContent);
		});

		test('Write file with json plugin', async () => {
			const testContent = {test: true};
			const testFile = await testHelper.createFile(faker.system.commonFileName('json'));

			const file = LoomFile.from( adapter, testFile);
			LoomFile.register(plugin);
			await file.stringify(testContent);
			await expect(file.text()).resolves.toBe(JSON.stringify(testContent));
		});

		test('No plugin for file', async () => {
			const testContent = {test: true};
			const testFile = await testHelper.createFile(faker.system.commonFileName('json'), JSON.stringify(testContent));

			const file = LoomFile.from( adapter, testFile);
			await expect(file.json()).rejects.toThrow(FileConvertException);
			await expect(file.stringify(testContent)).rejects.toThrow(FileConvertException);
		});

		test('No extension for file', async () => {
			const testContent = {test: true};
			const testFile = await testHelper.createFile(faker.system.directoryPath(), JSON.stringify(testContent));

			const file = LoomFile.from( adapter, testFile);
			await expect(file.json()).rejects.toThrow(FileConvertException);
			await expect(file.stringify(testContent)).rejects.toThrow(FileConvertException);
		});

		test('get converter plugin', async () => {
			const testContent = {test: true};
			const testFile = await testHelper.createFile(faker.system.commonFileName('json'), JSON.stringify(testContent));

			const file = new FileTest(adapter, testFile);
			LoomFile.register(plugin);
			const converter = await file.getConverterPlugin();
			expect(converter).toBe(plugin);
		});

		test('get converter plugin with no plugin', async () => {
			const testContent = {test: true};
			const testFile = await testHelper.createFile(faker.system.commonFileName('json'), JSON.stringify(testContent));

			const file = new FileTest(adapter, testFile);
			await expect(file.getConverterPlugin()).rejects.toThrow(FileConvertException);
		});

		test('get converter plugin with multiple plugin', async () => {
			const testContent = {test: true};
			const testFile = await testHelper.createFile(faker.system.commonFileName('yml'), JSON.stringify(testContent));

			const file = new FileTest(adapter, testFile);
			LoomFile.register(plugin);
			LoomFile.register({
				$type: PLUGIN_TYPE.FILE_CONVERTER,
				verify: (file: LoomFile) => file.extension === 'csv',
				parse: async <T>(file: LoomFile) => JSON.parse(await file.text()) as T,
				stringify: async (file: LoomFile, content: unknown) => await file.write(JSON.stringify(content)),
				nonce: Symbol('csv-converter')
			});
			const yamlConverter: LoomFileConverter = {
				$type: PLUGIN_TYPE.FILE_CONVERTER,
				verify: (file: LoomFile) => file.extension === 'yaml' || file.extension === 'yml',
				parse: async <T>(file: LoomFile) => JSON.parse(await file.text()) as T,
				stringify: async (file: LoomFile, content: unknown) => await file.write(JSON.stringify(content)),
				nonce: Symbol('yaml-converter')
			};
			LoomFile.register(yamlConverter);
			const converter = await file.getConverterPlugin();
			expect(converter).toBe(yamlConverter);
		});

		test('get converter reminds the plugin', async () => {
			const testContent = {test: true};
			const testFile = await testHelper.createFile(faker.system.commonFileName('json'), JSON.stringify(testContent));

			const file = new FileTest(adapter, testFile);
			LoomFile.register(plugin);
			const verify = vi.fn();
			LoomFile.register({
				$type: PLUGIN_TYPE.FILE_CONVERTER,
				verify,
				nonce: Symbol('csv-converter')
			} as unknown as LoomFileConverter);
			expect(verify).toBeCalledTimes(0);
			const converter = await file.getConverterPlugin();
			expect(verify).toBeCalledTimes(1);
			expect(converter).toBe(plugin);
			const converter2 = await file.getConverterPlugin();
			expect(verify).toBeCalledTimes(1);
			expect(converter2).toBe(plugin);
		});
	});


	describe('Test Symbol', () => {
		test('toPrimitive', () => {
			const file = LoomFile.from( adapter, './test/data/test.json');
			expect(`${file}`).toBe('test/data/test.json');
			expect(file + '').toBe('test/data/test.json');
			expect(String(file)).toBe('test/data/test.json');
			expect(+file).toBeNaN();
		});

		test('toStringTag', () => {
			const file = LoomFile.from( adapter, './test/data/test.json');
			expect(Object.prototype.toString.call(file)).toBe('[object LoomFile]');
		});
	});


});


describe('Test Error handling'	, () => {

	let testHelper: InMemoryAdapterHelper;
	let adapter: SourceAdapter;

	beforeAll(() => {
		FileTest.emptyPlugins();
	});

	beforeEach(async () => {
		testHelper = await InMemoryAdapterHelper.init();
		adapter = testHelper.adapter;
	});

	afterEach(async () => {
		await testHelper.destroy();
	});

	test('Read yaml file with invalid extension', async () => {

		const testContent = 'test: true';
		const testFile = await testHelper.createFile(faker.system.commonFileName('yaml'), testContent);
		const file = LoomFile.from( adapter, testFile);
		await expect(file.json()).rejects.toThrow(FileConvertException);
	});

	test('Plugin not registered for path', async () => {
		const testFile = testHelper.createFile(faker.system.commonFileName('json'), JSON.stringify({test: true}));
		const file = LoomFile.from( adapter, testFile);
		await expect(file.json()).rejects.toThrow(FileConvertException);
	});

	test('File convert exception', async () => {
		const testFile = testHelper.createFile('test/some', '{test: true}') ;

		const file = LoomFile.from(testHelper.adapter, testFile);
		await expect(file.text()).resolves.toBe('{test: true}');
		await expect(file.json()).rejects.toThrow(FileConvertException);
	});

});


