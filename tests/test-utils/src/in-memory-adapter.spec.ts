import { describe, test, expect } from 'vitest';
import { InMemoryAdapterHelper } from './in-memory-adapter.js';
import { faker } from '@faker-js/faker';

describe.concurrent('Test In Memory Adapter Helper', () => {

	test('Has readable adapter', async () => {
		const testHelper = InMemoryAdapterHelper.init();
		expect(testHelper.adapter).toBeDefined();
	});

	test('Create file with random path and fix content', async () => {
		const testContent = '1234k2hk3jh1fasdasfc%';
		const testHelper = InMemoryAdapterHelper.init();
		const testFile = testHelper.createFile(undefined, testContent);
		expect(testFile).toBeDefined();
		expect(testFile).toBeTypeOf('string');

		const file = testHelper.adapter.readFile(testFile);
		expect(file).toBeDefined();
		expect(file.toString()).toBe(testContent);
	});

	test('Create file with deep fix path and random content', async () => {
		const testContent = faker.lorem.word(10000);
		const testHelper = InMemoryAdapterHelper.init();
		const testFile = testHelper.createFile('test/deep/path/to/file.txt', testContent);
		expect(testFile).toBeDefined();
		expect(testFile).toBeTypeOf('string');

		const file = testHelper.adapter.readFile(testFile);
		expect(file).toBeDefined();
		expect(file.toString()).toBe(testContent);
	});

	test('Create file with deep fix path and random content and read with encoding', async () => {
		const testContent = faker.lorem.paragraph(1000);
		const testHelper = InMemoryAdapterHelper.init();
		const testFile = testHelper.createFile('test/deep/path/to/file.txt', testContent);
		expect(testFile).toBeDefined();
		expect(testFile).toBeTypeOf('string');

		const file = testHelper.adapter.readFile(testFile, 'utf8');
		expect(file).toBeDefined();
		expect(file).toBe(testContent);
	});

	test('Create file without ext', async () => {
		const testContent = faker.lorem.word(10000);
		const testHelper = InMemoryAdapterHelper.init();
		const testFile = testHelper.createFile('test/deep/path/to/file', testContent);
		expect(testFile).toBeDefined();
		expect(testFile).toBeTypeOf('string');

		const file = testHelper.adapter.readFile(testFile);
		expect(file).toBeDefined();
		expect(file.toString()).toBe(testContent);
	});
});