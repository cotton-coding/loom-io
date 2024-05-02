import { describe, test, expect, expectTypeOf } from 'vitest';
import { LoomFile } from '../../dist/core/file.js';
import { Directory } from '../../dist/core/dir.js';
import { LineResult } from '../../dist/helper/result.js';

describe('lib internal exports', () => {
	test('Createable LoomFile', () => {
		expect(LoomFile).toBeDefined();
		expectTypeOf(LoomFile).instance.toHaveProperty('path');
	});

	test('Crateable Directory', () => {
		expect(Directory).toBeDefined();
		expectTypeOf(Directory).instance.toHaveProperty('path');
	});

	test('Crateable LineResult', () => {
		expect(LineResult).toBeDefined();
		expectTypeOf(LineResult).instance.toHaveProperty('next');
	});
});