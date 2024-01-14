import { expect, test, describe, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { File } from './file.js';
import { FileConvertException, FileDoesNotExistException, PluginNotFoundException } from './exceptions.js';
import { TestFilesystemHelper } from '../../test/helpers/testFilesystemHelper.js';


import jsonConverter from '../plugins/jsonConverter.js';
import yamlConverter from '../plugins/yamlConverter.js';

class FileTest extends File {

	getPath() {
		return this.path;
	}

	static getConvertPlugins() {
		return Array.from(new Set(File.converterPlugins.values()));
	}

	static emptyPlugins() {
		File.converterPlugins = new Map();
	}
}

describe('Test File Service', () => {

	let testHelper: TestFilesystemHelper;

	beforeAll(() => {
		FileTest.emptyPlugins();
		File.register(jsonConverter);
		File.register(yamlConverter);
	});

	afterAll(() => {
		FileTest.emptyPlugins();
	});

	test('Create Instance and set path', () => {
		const path = './test/data/test.txt';
		const file = new FileTest(path);
		expect(file).toBeInstanceOf(File);
		expect(file.getPath()).toBe(path);
	});

	test('Create Instance with invalid path', () => {
		const path = './test/data/test2.txt';
		expect(() => new File(path)).toThrow(FileDoesNotExistException);
	});

	test('Register plugins', async () => {
		new File('./test/data/test.json');
		const plugins = FileTest.getConvertPlugins();
		expect(plugins).toHaveLength(2);
	});
    

	describe('Test with generaed file', () => {

		beforeEach(async () => {
			testHelper = await TestFilesystemHelper.init();
		});
    
		afterEach(async () => {
			await testHelper.destroy();
		});

		test('Read text file', async () => {

			const testFile = await testHelper.createFile();
			const file = new File(testFile.includeBasePath().getPath());
			const content = await file.text();
			expect(content).toBe(testFile.getContent());
		});

		test.each(['json', 'yaml', 'yml', 'log', 'txt'])('Get extenction %s', async (extention) => {
			const testFile = await testHelper.createFile('', { extention });
			const file = new File(testFile.includeBasePath().getPath());
			expect(file.extention).toBe(extention);

		});

		test('Read json file', async () => {
            
			const testContent = {test: true};
			const testFile = await testHelper.createFile(JSON.stringify(testContent), { extention: 'json' });

			const file = new File(testFile.includeBasePath().getPath());
			const content = await file.json();
			expect(content).toStrictEqual(testContent);
		});

		test('Read yaml file', async () => {
                
			const testContent = 'test: true';
			const testFile = await testHelper.createFile(testContent, { extention: 'yaml' });

			const file = new File(testFile.includeBasePath().getPath());
			const content = await file.json<{test: boolean}>();
			expect(content.test).toBe(true);
		});

		test('Read yml file', async () => {
                        
			const testContent = 'test: true';
			const testFile = await testHelper.createFile(testContent, { extention: 'yml' });

			const file = new File(testFile.includeBasePath().getPath());
			const content = await file.json<{test: boolean}>();
			expect(content.test).toBe(true);
		});

		test('Read file plain', async () => {
			const testContent = '1234k2hk3jh1fasdasfc%';
			const testFile = await testHelper.createFile(testContent, { extention: 'rtx' });
			const path = testFile.includeBasePath().getPath();

			const file = new File(path);
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

	test('Read yaml file with invalid extention', async () => {
                    
		const testContent = 'test: true';
		const testFile = await testHelper.createFile(testContent, { extention: 'json' });
	
		const file = new File(testFile.includeBasePath().getPath());
		expect(() => file.json()).rejects.toThrow(PluginNotFoundException);
	});

	test('Plugin not registered for path', async () => {

		const testFile = testHelper.createFile('test', { extention: 'md' });
		const path = (await testFile).includeBasePath().getPath();
					
		const file = new File(path);
		expect(() => file.json()).rejects.toThrow(PluginNotFoundException);
	});

	test('No file extenstion', async () => {
		
		const testFile = testHelper.createFile('{test: true}', { path: 'test/test' });
		const path = (await testFile).includeBasePath().getPath();
					
		const file = new File(path);
		expect(file.text()).resolves.toBe('{test: true}');
		expect(file.json()).rejects.toThrow(FileConvertException);
	});
});


