import { describe, test, expect, expectTypeOf } from 'vitest';
import { LoomFile } from '../../dist/core/file';

describe('lib internal exports', () => {
	test('Createable LoomFile', () => {
		expect(LoomFile).toBeDefined();
		expectTypeOf(LoomFile).instance.toHaveProperty('path');
	});

	test('Crateable Directory', () => {
		expect(LoomFile).toBeDefined();
		expectTypeOf(LoomFile).instance.toHaveProperty('path');
	});

	test('Crateable LineResult', () => {
		expect(LoomFile).toBeDefined();
		expectTypeOf(LoomFile).instance.toHaveProperty('next');
	});
});