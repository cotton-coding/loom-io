import { expect, test, describe, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { File } from './file.js';
import { FileDoesNotExistException, PluginNotFoundException } from './exceptions.js';
import { TestFilesystemHelper } from '../../test/helpers/testFilesystemHelper.js';


import jsonConverter from '../plugins/jsonConverter.js';
import yamlConverter from '../plugins/yamlConverter.js';


class FileTest extends File {

	getPath() {
		return this.path;
	}

	static getPlugins() {
		return File.plugins;
	}

	static emptyPlugins() {
		File.plugins = [];
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
		expect(() => new File(path)).toThrow(FileDoesNotExistException as ErrorConstructor);
	});

	test('Register plugins', async () => {
		new File('./test/data/test.json');
		const plugins = FileTest.getPlugins();
		expect(plugins).toHaveLength(2);
	});

	test('Create from Array', async () => { 
            
		const paths = ['./test/data/test.json', './test/data/test.yaml'];
		const files = await File.fromArray(paths);
		const fileArray = files.asArray();
		expect(fileArray).toHaveLength(2);
		expect(fileArray[0]).toBeInstanceOf(File);
		expect(fileArray[1]).toBeInstanceOf(File);

		for(let x = 0; x < 3; x++) {
			let loopCount = 0;
			for (const file of files) {
				expect(file).toBeInstanceOf(File);
				loopCount++;
			}
			expect(loopCount).toBe(2);
		}
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

		

	});
});


describe.todo('Test with missing plugins'	, () => {

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
		expect(() => file.json()).toThrow(PluginNotFoundException);
	});

	test('Plugin not registered for path', async () => {

		const testFile = testHelper.createFile('test', { extention: 'md' });
					
		const file = new File((await testFile).includeBasePath().getPath());
		expect(() => file.json()).toThrow(PluginNotFoundException);
	});
});


