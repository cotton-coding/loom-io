import { vi, describe, test, expect } from 'vitest';
import yamlConverter from './yaml-converter';
import { LoomFile, PLUGIN_TYPE } from '@loom-io/core';

describe('json-converter', () => {

	test('type', () => {
		expect(yamlConverter()).toHaveProperty('$type');
		expect(yamlConverter().$type).toBe(PLUGIN_TYPE.FILE_CONVERTER);
	});

	test('verify', () => {
		const file = { extension: 'yaml' } as LoomFile;
		expect(yamlConverter().verify(file)).toBe(true);
		const file2 = { extension: 'yml' } as LoomFile;
		expect(yamlConverter().verify(file2)).toBe(true);
	});

	test('stringify', async () => {
		const file = {
			write: vi.fn(),
		} as unknown as LoomFile;
		const content = { test: true };
		await yamlConverter().stringify(file, content);
		expect(file.write).toHaveBeenCalledWith('test: true\n');
	});

	test('parse', async () => {
		const file = {
			text: vi.fn().mockReturnValue(Promise.resolve('test: true\n')),
		} as unknown as LoomFile;
		const content = await yamlConverter().parse(file);
		expect(content).toEqual({ test: true });
	});
});