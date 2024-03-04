import { expect, test, describe, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { LoomFile } from './file.js';
import { FileConvertException, PluginNotFoundException } from './exceptions.js';
import { TestFilesystemHelper } from '../../test/helpers/testFilesystemHelper.js';

import { basename, dirname } from 'node:path';
import { Directory } from './dir.js';
import { FILE_SIZE_UNIT } from './types.js';
import { faker } from '@faker-js/faker';
import { Editor } from './editor.js';

class FileTest extends LoomFile {

	constructor(path: string){
		const dir = new Directory(dirname(path));
		super(dir, basename(path));
	}

	static getConvertPlugins() {
		return Array.from(new Set(LoomFile.converterPlugins.values()));
	}

	static emptyPlugins() {
		LoomFile.converterPlugins = new Map();
	}
}

describe('Test File Service', () => {

	let testHelper: TestFilesystemHelper;

	afterAll(() => {
		FileTest.emptyPlugins();
	});

	test('Create Instance and set path', () => {
		const path = 'test/data/test.txt';
		const file = LoomFile.from(path);
		expect(file).toBeInstanceOf(LoomFile);
		expect(file.path).toBe(`${process.cwd()}/${path}`);
	});

	test('Test if path exits', async () => {
		const path = './test/data/test.json';
		const exists = LoomFile.exists(path);
		expect(exists).toBeTruthy();
	});

	test('Test if path do not exits', async () => {
		const path = './test/data/test2.txt';
		const exists = await LoomFile.exists(path);
		expect(exists).toBeFalsy();
	});

	test('Get file size', async () => {
		const helper = await TestFilesystemHelper.init();
		const path = 'test/data/test.txt';
		const content = faker.lorem.words(10000);
		const testFilePath = (await helper.createFile(content, { path })).includeBasePath().getPath();
		const file = LoomFile.from(testFilePath);
		const bytes = await file.getSize(FILE_SIZE_UNIT.BYTE);
		expect(bytes).toBe(content.length);
		const megaBytes = await file.getSize(FILE_SIZE_UNIT.MEGABYTE);
		expect(megaBytes).toBe(content.length / 1024 / 1024);
		const yottaBytes = await file.getSize(FILE_SIZE_UNIT.YOTTABYTE);
		expect(yottaBytes).toBe(content.length / 1024 / 1024 / 1024 / 1024 / 1024 / 1024 / 1024 / 1024);
		const gigaByte = await file.getSize(FILE_SIZE_UNIT.GIGABYTE);
		expect(gigaByte).toBe(content.length / 1024 / 1024 / 1024);
	});

	test('If File exists on Object', async () => {
		const file = LoomFile.from('./test/data/test.json');
		const exists = await file.exists();
		expect(exists).toBeTruthy();
	});
	test('If File exists on Object', async () => {
		const file = LoomFile.from('./test/data/notexists.json');
		const exists = await file.exists();
		expect(exists).toBeFalsy();
	});

	test('Register plugins', async () => {
		const plugins = FileTest.getConvertPlugins();
		expect(plugins).toHaveLength(0);
	});

	test('get parent or dir', () => {
		const file = LoomFile.from('./test/data/test.json');
		expect(file.dir).instanceOf(Directory);
		expect(file.dir.path).toBe(`${process.cwd()}/test/data`);
		expect(file.dir).toBe(file.parent);
	});

	test('get reader object', async () => {
		const file = LoomFile.from('./test/data/test.json');
		const reader = await file.reader();
		expect(reader).toBeDefined();
		expect(reader).toBeInstanceOf(Editor);
		reader.close();
	});
  
	describe('Test with generated file', () => {

		beforeEach(async () => {
			testHelper = await TestFilesystemHelper.init();
		});
    
		afterEach(async () => {
			await testHelper.destroy();
		});

		test('Read text file', async () => {

			const testFile = await testHelper.createFile();
			const file = LoomFile.from(testFile.includeBasePath().getPath());
			const content = await file.text();
			expect(content).toBe(testFile.getContent());
		});

		test.each(['json', 'yaml', 'yml', 'log', 'txt'])('Get extension %s', async (extension) => {
			const testFile = await testHelper.createFile('', { extension });
			const file = LoomFile.from(testFile.includeBasePath().getPath());
			expect(file.extension).toBe(extension);

		});

		test.todo('Read json file', async () => {
            
			const testContent = {test: true};
			const testFile = await testHelper.createFile(JSON.stringify(testContent), { extension: 'json' });

			const file = LoomFile.from(testFile.includeBasePath().getPath());
			const content = await file.json();
			expect(content).toStrictEqual(testContent);
		});

		test.todo('Read yaml file', async () => {
                
			const testContent = 'test: true';
			const testFile = await testHelper.createFile(testContent, { extension: 'yaml' });

			const file = LoomFile.from(testFile.includeBasePath().getPath());
			const content = await file.json<{test: boolean}>();
			expect(content.test).toBe(true);
		});

		test.todo('Read yml file', async () => {
                        
			const testContent = 'test: true';
			const testFile = await testHelper.createFile(testContent, { extension: 'yml' });

			const file = LoomFile.from(testFile.includeBasePath().getPath());
			const content = await file.json<{test: boolean}>();
			expect(content.test).toBe(true);
		});

		test('Read file plain', async () => {
			const testContent = '1234k2hk3jh1fasdasfc%';
			const testFile = await testHelper.createFile(testContent, { extension: 'rtx' });
			const path = testFile.includeBasePath().getPath();

			const file = LoomFile.from(path);
			const content = await file.plain();
			expect(content).toBeInstanceOf(Buffer);
			expect(content.toString()).toBe(testContent);
		});

		

	});
});


describe('Test Error handling'	, () => {

	let testHelper: TestFilesystemHelper;

	beforeAll(() => {
		FileTest.emptyPlugins();
	});

	beforeEach(async () => {
		testHelper = await TestFilesystemHelper.init();
	});
	
	afterEach(async () => {
		await testHelper.destroy();
	});

	test('Read yaml file with invalid extension', async () => {
                    
		const testContent = 'test: true';
		const testFile = await testHelper.createFile(testContent, { extension: 'json' });
	
		const file = LoomFile.from(testFile.includeBasePath().getPath());
		expect(() => file.json()).rejects.toThrow(PluginNotFoundException);
	});

	test('Plugin not registered for path', async () => {

		const testFile = testHelper.createFile('test', { extension: 'md' });
		const path = (await testFile).includeBasePath().getPath();
					
		const file = LoomFile.from(path);
		expect(() => file.json()).rejects.toThrow(PluginNotFoundException);
	});

	test('No file extension', async () => {
		
		const testFile = testHelper.createFile('{test: true}', { path: 'test/test' });
		const path = (await testFile).includeBasePath().getPath();
					
		const file = LoomFile.from(path);
		expect(file.text()).resolves.toBe('{test: true}');
		expect(file.json()).rejects.toThrow(FileConvertException);
	});
});


