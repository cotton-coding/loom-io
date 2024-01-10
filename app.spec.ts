import { expect, test, describe, beforeAll } from 'bun:test';
import { LoomFs } from './app.js';
import jsonConverter from './src/plugins/jsonConverter.js';
import yamlConverter from './src/plugins/yamlConverter.js';
import { Directory } from './src/dir.js';
import { File } from './src/file.js';


class LoomFsTest extends LoomFs {

	static getPluginHashes() {
		return this.pluginHashes;
	}
}

describe('Test Entry', () => {

	beforeAll(() => {
		LoomFs.register(jsonConverter);
		LoomFs.register(yamlConverter);
	});

	test('Has Statics to create Dir and Files', () => {
		expect(LoomFs).toBeDefined();
		expect(LoomFs.dir).toBeDefined();
		expect(LoomFs.file).toBeDefined();
	});

	test('Register Plugins', () => {
		const pluginHashes = LoomFsTest.getPluginHashes();
		expect(pluginHashes).toHaveLength(2);
	});

	test('Register Plugins only once', () => {
		const pluginHashes = LoomFsTest.getPluginHashes();
		expect(pluginHashes).toHaveLength(2);
		LoomFs.register(jsonConverter);
		expect(pluginHashes).toHaveLength(2);
	});

	test('Get Dir Instance', () => {
		const dir = LoomFs.dir('./test/data');
		expect(dir).toBeDefined();
		expect(dir).toBeInstanceOf(Directory);
	});

	test('Get File Instance', () => {
		const file = LoomFs.file('./test/data/test.json');
		expect(file).toBeDefined();
		expect(file).toBeInstanceOf(File);
	});

    

});