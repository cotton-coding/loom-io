import { expect, describe, test } from 'vitest';
import { LoomSourceAdapter, PLUGIN_TYPE } from '@loom-io/core';
import { Directory, LoomFile } from '@loom-io/core/internal';



export function testSource(key: string, LoomSourceAdapter: LoomSourceAdapter) {
	describe('source', () => {

		test('Should fit the LoomSourceAdapter interface', () => {
			expect(LoomSourceAdapter).toBeDefined();
			expect(LoomSourceAdapter.$type).toBe(PLUGIN_TYPE.SOURCE_ADAPTER);
			expect(LoomSourceAdapter.source).instanceOf(Function);
		});

		test('if wrong key should return undefined', async () => {
			const result = await LoomSourceAdapter.source('wrong-key://some/data/');
			expect(result).toBeUndefined();
		});

		test('Should return a Directory', async () => {
			const result = await LoomSourceAdapter.source(`${key}some/data`, Directory);
			expect(result).toBeInstanceOf(Directory);
			expect(result!.path).toBe('some/data');
		});

		test('Should return a Directory or LoomFile', async () => {
			const result = await LoomSourceAdapter.source(`${key}some/data`, LoomFile);
			expect(result).toBeInstanceOf(LoomFile);
		});

		test('If no tpye is set and tailing slash should be a Directory', async () => {
			const result = await LoomSourceAdapter.source(`${key}some/data/`);
			expect(result).toBeInstanceOf(Directory);
		});

		test('If no tpye is set and no tailing slash should be a Directory if not exits', async () => {
			const result = await LoomSourceAdapter.source(`${key}some/data`);
			expect(result).toBeInstanceOf(Directory);
		});

	});
}