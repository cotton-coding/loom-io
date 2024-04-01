import { vi, describe, test, expect } from 'vitest';
import jsonConverter from './json-converter';
import { LoomFile } from '@loom-io/core';

describe('json-converter', () => {

	test('type', () => {
		expect(jsonConverter()).toHaveProperty('$type');
	});

	test('verify', () => {
		const file = { extension: 'json' } as LoomFile;
		expect(jsonConverter().verify(file)).toBe(true);
	});

	test('stringify', async () => {
		const file = {
			write: vi.fn(),
		} as unknown as LoomFile;
		const content = { test: true };
		await jsonConverter().stringify(file, content);
		expect(file.write).toHaveBeenCalledWith(JSON.stringify(content, null, 2));
	});

	test('parse', async () => {
		const file = {
			text: vi.fn().mockReturnValue(Promise.resolve('{"test":true}')),
		} as unknown as LoomFile;
		const content = await jsonConverter().parse(file);
		expect(content).toEqual({ test: true });
	});
});