import { describe, test, expect } from 'vitest';
import { LineResultMock } from '../test/mocks.js';
import { FrontMatterTypeNotSupportedException, getFrontMatterConverter, hasFrontMatter } from './utils.js';
import { LineResult } from '@loom-io/core/internal';
import * as YAML from 'yaml';

describe('utils', () => {
	test('hasFrontMatter has front matter', () => {
		const line = (new LineResultMock([
			'---',
			'key: value',
			'---',
			'content'
		])) as unknown as LineResult;
		expect(hasFrontMatter(line)).resolves.toBe(true);
	});

	test('hasFrontMatter has no front matter', () => {
		const line = (new LineResultMock([
			'content'
		])) as unknown as LineResult;
		expect(hasFrontMatter(line)).resolves.toBe(false);
	});


	test('getFrontMatterConverter returns json', () => {
		const line = (new LineResultMock([
			'---json',
			'{"key": "value"}',
			'---',
			'content'
		])) as unknown as LineResult;
		expect(getFrontMatterConverter(line)).resolves.toEqual(JSON);
	});

	test('getFrontMatterConverter returns default (yaml)', () => {
		const line = (new LineResultMock([
			'---',
			'key: value',
			'---',
			'content'
		])) as unknown as LineResult;
		expect(getFrontMatterConverter(line)).resolves.toEqual(YAML);
	});

	test('getFrontMatterConverter returns yaml', () => {
		const line = (new LineResultMock([
			'---yaml',
			'key: value',
			'---',
			'content'
		])) as unknown as LineResult;
		expect(getFrontMatterConverter(line)).resolves.toEqual(YAML);
	});

	test('getFrontMatterConverter throw on unknown type', () => {
		const line = (new LineResultMock([
			'---test',
			'key: value',
			'---',
			'content'
		])) as unknown as LineResult;
		expect(getFrontMatterConverter(line)).rejects.toThrow(FrontMatterTypeNotSupportedException);
	});

});