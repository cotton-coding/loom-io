import { describe, test, expect } from 'vitest';
import { LineResultMock } from '../test/mocks.js';
import { LineResult } from '@loom-io/core/internal';
import { readContent, readFrontMatter } from './parse.js';


describe('parse', () => {
	test('readFrontMatter reads front matter', () => {
		const line = (new LineResultMock([
			'---',
			'key: value',
			'---',
			'content'
		])) as unknown as LineResult;
		line.next();
		expect(readFrontMatter(line)).resolves.toBe('key: value');
	});

	test('readFrontMatter reads front matter long content', () => {
		const line = (new LineResultMock([
			'---',
			'key: value',
			'key2: value2',
			'key3:',
			'  - value3',
			'  - value4',
			'---',
			'content'
		])) as unknown as LineResult;
		line.next();
		expect(readFrontMatter(line)).resolves.toBe('key: value\nkey2: value2\nkey3:\n  - value3\n  - value4');
	});



	test('readContent reads content', () => {
		const line = (new LineResultMock([
			'---',
			'key: value',
			'---',
			'content',
			'some more content',
			'even more content'
		])) as unknown as LineResult;
		line.next();
		line.next();
		line.next();
		expect(readContent(line)).resolves.toBe('content\nsome more content\neven more content');
	});

});