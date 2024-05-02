import { testSource } from '@loom-io/interface-tests';
import FilesystemSourceAdapter from '../src/exports/lib.js';
import { describe, expect, test } from 'vitest';
import { source } from '../src/core/source.js';
import { LoomFile } from '@loom-io/core/internal';



testSource('file://', FilesystemSourceAdapter());

describe('Detail source test for node-fs adapter', () => {
	test('should return a LoomFile for a existing file path', async () => {
		const file = await source('adapters/node-fs/src/core/source.ts');
		expect(file).toBeDefined();
		expect(file).toBeInstanceOf(LoomFile);
		expect(file).toHaveProperty('path', 'adapters/node-fs/src/core/source.ts');
	});

	test('should return a Directory for a existing directory path', async () => {
		const dir = await source('adapters/node-fs/src/core');
		expect(dir).toBeDefined();
		expect(dir).not.toBeInstanceOf(LoomFile);
		expect(dir).toHaveProperty('path', 'adapters/node-fs/src/core');
	});

});