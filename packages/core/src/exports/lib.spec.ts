import { expect, test, describe, beforeAll } from 'vitest';
import { LoomIO } from './lib.js';
import { Directory } from '../core/dir.js';
import { LoomFile } from '../core/file.js';


class LoomFsTest extends LoomIO {

	static getPluginHashes() {
		return this.pluginHashes;
	}
}

describe('Test Entry', () => {

	beforeAll(() => {
	});

	test('Has Statics to create Dir and Files', () => {
		expect(LoomIO).toBeDefined();
		expect(LoomIO.dir).toBeDefined();
		expect(LoomIO.file).toBeDefined();
		expect(LoomIO.root).toBeDefined();
	});

	test('Register Plugins', () => {
		const pluginHashes = LoomFsTest.getPluginHashes();
		expect(pluginHashes).toHaveLength(0);
	});

	// test('Register Plugins only once', () => {
	// 	const pluginHashes = LoomFsTest.getPluginHashes();
	// 	expect(pluginHashes).toHaveLength(2);
	// 	LoomIO.register(jsonConverter);
	// 	expect(pluginHashes).toHaveLength(2);
	// });

	test('Get Dir Instance', () => {
		const dir = LoomIO.dir('./test/data');
		expect(dir).toBeDefined();
		expect(dir).toBeInstanceOf(Directory);
	});

	test('Get root dir', () => {
		const dir = LoomIO.root();
		expect(dir).toBeDefined();
		expect(dir.path).toBe(process.cwd());
	});

	test('Get File Instance', () => {
		const file = LoomIO.file('test/data/test.json');
		expect(file).toBeDefined();
		expect(file).toBeInstanceOf(LoomFile);
	});

    

});