import { expect, test, describe, beforeEach, afterEach, beforeAll } from 'vitest';

import LoomIO, { LoomFile, Directory, Editor, FILE_SIZE_UNIT } from '@loom-io/core';
import { FilesystemHelper } from '@loom-io/test-utils';
import yamlConverter from '@loom-io/yamlConverter';
import jsonConverter from '@loom-io/jsonConverter';

import { faker } from '@faker-js/faker';


describe('Test File Service', () => {

	beforeAll(() => {
		LoomIO.register(jsonConverter);
		LoomIO.register(yamlConverter);
	});

	test('Create Instance and set path', () => {
		const path = 'test-data/test.txt';
		const file = LoomIO.file(path);
		expect(file).toBeInstanceOf(LoomFile);
		expect(file.path).toBe(`${process.cwd()}/${path}`);
	});

	test('Test if path exits', async () => {
		const path = './test-data/test.json';
		const exists = LoomFile.exists(path);
		expect(exists).toBeTruthy();
	});

	test('Test if path do not exits', async () => {
		const path = './test-data/test2.txt';
		const exists = await LoomFile.exists(path);
		expect(exists).toBeFalsy();
	});

	test('Get file size', async () => {
		const helper = await FilesystemHelper.init();
		const path = 'test-data/test.txt';
		const content = faker.lorem.words(10000);
		const testFilePath = (await helper.createFile(content, { path })).includeBasePath().getPath();
		const file = LoomIO.file(testFilePath);
		const bytes = await file.getSize(FILE_SIZE_UNIT.BYTE);
		expect(bytes).toBe(content.length);
		const megaBytes = await file.getSize(FILE_SIZE_UNIT.MEGABYTE);
		expect(megaBytes).toBe(content.length / 1024 / 1024);
		const yottaBytes = await file.getSize(FILE_SIZE_UNIT.YOTTABYTE);
		expect(yottaBytes).toBe(content.length / 1024 / 1024 / 1024 / 1024 / 1024 / 1024 / 1024 / 1024);
		const gigaByte = await file.getSize(FILE_SIZE_UNIT.GIGABYTE);
		expect(gigaByte).toBe(content.length / 1024 / 1024 / 1024);
		helper.destroy();
	});

	test('If File exists', async () => {
		const file = LoomIO.file('./test-data/test.json');
		const exists = await file.exists();
		expect(exists).toBeTruthy();
	});
	test('If File not exist', async () => {
		const file = LoomIO.file('../test-data/notexists.json');
		const exists = await file.exists();
		expect(exists).toBeFalsy();
	});

	test('get parent or dir', () => {
		const file = LoomIO.file('./test-data/test.json');
		expect(file.dir).instanceOf(Directory);
		expect(file.dir.path).toBe(`${process.cwd()}/test-data`);
		expect(file.dir).toBe(file.parent);
	});

	test('get reader object', async () => {
		const file = LoomIO.file('./test-data/test.json');
		const reader = await file.reader();
		expect(reader).toBeDefined();
		expect(reader).toBeInstanceOf(Editor);
		reader.close();
	});
  
	describe('Test with generated file', () => {


		let testHelper: FilesystemHelper;

		beforeEach(async () => {
			testHelper = await FilesystemHelper.init();
		});
    
		afterEach(async () => {
			await testHelper.destroy();
		});

		test('Read text file', async () => {

			const testFile = await testHelper.createFile();
			const file = LoomIO.file(testFile.includeBasePath().getPath());
			const content = await file.text();
			expect(content).toBe(testFile.getContent());
		});

		test.each(['json', 'yaml', 'yml', 'log', 'txt'])('Get extension %s', async (extension) => {
			const testFile = await testHelper.createFile('', { extension });
			const file = LoomIO.file(testFile.includeBasePath().getPath());
			expect(file.extension).toBe(extension);

		});

		test('Read json file', async () => {
            
			const testContent = {test: true};
			const testFile = await testHelper.createFile(JSON.stringify(testContent), { extension: 'json' });

			const file = LoomIO.file(testFile.includeBasePath().getPath());
			const content = await file.json();
			expect(content).toStrictEqual(testContent);
		});

		test('Read yaml file', async () => {
                
			const testContent = 'test: true';
			const testFile = await testHelper.createFile(testContent, { extension: 'yaml' });

			const file = LoomIO.file(testFile.includeBasePath().getPath());
			const content = await file.json<{test: boolean}>();
			expect(content.test).toBe(true);
		});

		test('Read yml file', async () => {
                        
			const testContent = 'test: true';
			const testFile = await testHelper.createFile(testContent, { extension: 'yml' });

			const file = LoomIO.file(testFile.includeBasePath().getPath());
			const content = await file.json<{test: boolean}>();
			expect(content.test).toBe(true);
		});

		test('Read file plain', async () => {
			const testContent = '1234k2hk3jh1fasdasfc%';
			const testFile = await testHelper.createFile(testContent, { extension: 'rtx' });
			const path = testFile.includeBasePath().getPath();

			const file = LoomIO.file(path);
			const content = await file.plain();
			expect(content).toBeInstanceOf(Buffer);
			expect(content.toString()).toBe(testContent);
		});

		

	});
});




