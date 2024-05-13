import { expect, describe, test } from 'vitest';
import { LoomSourceAdapter } from '@loom-io/core';
import { Directory, LoomFile } from '@loom-io/core/internal';



export function testSource(LoomSourceAdapter: LoomSourceAdapter) {
	describe('source', () => {

		test('Should fit the LoomSourceAdapter interface', () => {
			expect(LoomSourceAdapter).toBeDefined();
			expect(LoomSourceAdapter).toHaveProperty('file');
			expect(LoomSourceAdapter).toHaveProperty('dir');
		});

		test('Should return a Directory', async () => {
			const result = await LoomSourceAdapter.dir('/some/data');
			expect(result).toBeInstanceOf(Directory);
			expect(result.path).toBe('/some/data');
		});

		test('Should return a LoomFile', async () => {
			const result = await LoomSourceAdapter.file('/some/data.pdf');
			expect(result).toBeInstanceOf(LoomFile);
			expect(result.path).toBe('/some/data.pdf');
		});

	});
}