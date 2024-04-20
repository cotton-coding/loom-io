import { describe, test, expect } from 'vitest';
import * as YAML from 'yaml';
import frontMatterConverter, { getFrontMatterConverter, hasFrontMatter, readContent, readFrontMatter } from './converter';
import { LineResult } from '../../../packages/core/dist/helper/result';
import { Editor, LoomFile } from '@loom-io/core';

class LineResultMock {
	lines: string[];
	index: number;
	constructor(lines: string[] = []) {
		this.lines = lines;
		this.index = 0;
	}

	async next() {
		this.index++;
	}

	async hasNext() {
		return this.index < this.lines.length;
	}

	async read(encoding: string) {
		return this.lines[this.index];
	}
}

class EditorMock {
	constructor(public lines: string[]) {}

	async firstLine() {
		return new LineResultMock(this.lines) as unknown as LineResult;
	}
}

class FileMock {
	lines: string[];
	extension: string;
	constructor(lines: string[] = [], extension: string = 'md') {
		this.lines = lines;
		this.extension = extension;
	}

	get fullName() {
		return 'file.' + this.extension;
	}

	reader() {
		return new EditorMock(this.lines) as unknown as Editor;
	}

}


describe('FrontMatterConverter', () => {

	describe('test main functionality', async () => {

		test('verify', () => {
			const file = (new FileMock()) as unknown as LoomFile;
			const json = (new FileMock([], 'json')) as unknown as LoomFile;
			const converter = frontMatterConverter();
			expect(converter.verify(file)).toBe(true);
			expect(converter.verify(json)).toBe(false);
		});

		test.each([
			'nyk',
			'page.md',
			'blog.md',
			'cotton-coding.md',
			'loom.story.md'
		])('verify with other extension %s', (extension) => {
			const file = (new FileMock([], extension)) as unknown as LoomFile;
			const other = (new FileMock([], 'lorem')) as unknown as LoomFile;
			const converter = frontMatterConverter({ extensions: [extension]});
			expect(converter.verify(file)).toBe(true);
			expect(converter.verify(other)).toBe(false);
		});

		test('verify list of extensions', () => {
			const md = (new FileMock()) as unknown as LoomFile;
			const txt = (new FileMock([], 'txt')) as unknown as LoomFile;
			const other = (new FileMock([], 'other')) as unknown as LoomFile;
			const converter = frontMatterConverter({ extensions: ['md', 'txt']});
			expect(converter.verify(md)).toBe(true);
			expect(converter.verify(txt)).toBe(true);
			expect(converter.verify(other)).toBe(false);
		});

		test('parse front matter', async () => {
			const file = (new FileMock([
				'---',
				'key: value',
				'---',
				'content'
			])) as unknown as LoomFile;
			const converter = frontMatterConverter();
			const parsed = await converter.parse(file) as {data: {key: string}, content: string};
			expect(parsed.data).toEqual({ key: 'value' });
			expect(parsed.content).toBe('content');
		});

	});

	describe('test base functions', () => {
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
});