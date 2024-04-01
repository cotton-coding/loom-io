import { vi, describe, test, expect } from 'vitest';
import yamlConverter from './yaml-converter';
import { LoomFile, PLUGIN_TYPE } from '@loom-io/core';

describe('json-converter', () => {

	test('type', () => {
		expect(yamlConverter()).toHaveProperty('$type');
		expect(yamlConverter().$type).toBe(PLUGIN_TYPE.FILE_CONVERTER);
	});

	test('nonce need to be same on each result', () => {
		const converter = yamlConverter();
		expect(converter.nonce).toBeDefined();
		expect(yamlConverter().nonce).toBe(converter.nonce);
	});

	test.each(['yml', 'yaml'])('verify with %s', (ext) => {
		const file = { extension: ext } as LoomFile;
		expect(yamlConverter().verify(file)).toBe(true);
	});

	test.each(['json', 'csv', 'md', 'xml', 'xsd', 'docx', 'pdf'])('verify with %s should false', (value) => {
		const file = { extension: value } as LoomFile;
		expect(yamlConverter().verify(file)).toBe(false);
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