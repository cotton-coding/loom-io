import { describe, test, expect, SpyInstance } from 'vitest';
import * as YAML from 'yaml';
import frontMatterConverter, { ensureNewLine, getFrontMatterConverter, hasFrontMatter, readContent, readFrontMatter, stringifyJson, writeToFile } from './converter';
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
		if(this.lines.length === 0) {
			return undefined;
		}
		return new LineResultMock(this.lines) as unknown as LineResult;
	}
}

class FileMock {
	lines: string[];
	extension: string;
	constructor(lines: string[] = [''], extension: string = 'md') {
		this.lines = lines;
		this.extension = extension;
	}

	get name() {
		return 'file.' + this.extension;
	}

	reader() {
		return new EditorMock(this.lines) as unknown as Editor;
	}

	write(content: string) {
		this.lines = content.split('\n');
		return Promise.resolve();
	}

}


describe('FrontMatterConverter', () => {

	describe('test main functionality', async () => {

		test('has nonce', () => {
			const converter = frontMatterConverter();
			expect(converter.nonce).toBeDefined();
		});

		test('has different nonce per config', () => {
			const converter1 = frontMatterConverter();
			const converter2 = frontMatterConverter({ extensions: ['md'] });
			expect(converter1.nonce).not.toBe(converter2.nonce);
		});

		test('has same nonce for same config', () => {
			const converter1 = frontMatterConverter();
			const converter2 = frontMatterConverter();
			const converter3 = frontMatterConverter({ extensions: ['test.lorem'] });
			const converter4 = frontMatterConverter({ extensions: ['test.lorem'] });
			expect(converter1.nonce).toBe(converter2.nonce);
			expect(converter3.nonce).toBe(converter4.nonce);
			expect(converter1.nonce).not.toBe(converter3.nonce);
		});

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

		test('parse front matter and ignore empty line before content', async () => {
			const file = (new FileMock([
				'---',
				'key: value',
				'---',
				'',
				'content'
			])) as unknown as LoomFile;
			const converter = frontMatterConverter();
			const parsed = await converter.parse(file) as {data: {key: string}, content: string};
			expect(parsed.data).toEqual({ key: 'value' });
			expect(parsed.content).toBe('content');
		});

		test('parse front matter and ignore empty line before multiline content', async () => {
			const file = (new FileMock([
				'---',
				'key: value',
				'---',
				'',
				'content',
				'test',
				'',
				'line'
			])) as unknown as LoomFile;
			const converter = frontMatterConverter();
			const parsed = await converter.parse(file) as {data: {key: string}, content: string};
			expect(parsed.data).toEqual({ key: 'value' });
			expect(parsed.content).toBe('content\ntest\n\nline');
		});

		test('stringify write empty data', async () => {
			const file = new FileMock();
			const converter = frontMatterConverter();
			await converter.stringify(file as unknown as LoomFile, undefined);
			expect(file.lines).toStrictEqual(['---', '---', '']);
		});

		test('stringify front matter', async () => {
			const file = new FileMock();
			const data = { key: 'value' };
			const converter = frontMatterConverter();
			await converter.stringify(file as unknown as LoomFile, data);
			expect(file.lines).toStrictEqual(['---', 'key: value', '---', '']);
		});

		test('stringify front matter with multiline data', async () => {
			const file = new FileMock();
			const data = { key: 'value', 'cotton': 'coding' };
			const converter = frontMatterConverter();
			await converter.stringify(file as unknown as LoomFile, data);
			expect(file.lines).toStrictEqual(['---', 'key: value', 'cotton: coding', '---', '']);
		});

		test('stringify front matter with content', async () => {
			const file = new FileMock();
			const data = { key: 'value' };
			const content = 'content';
			const converter = frontMatterConverter();
			await converter.stringify(file as unknown as LoomFile, { data, content });
			expect(file.lines).toStrictEqual(['---', 'key: value', '---', '', 'content']);
		});

		test('stringify front matter with multiline content', async () => {
			const file = new FileMock();
			const data = { key: 'value', 'cotton': 'coding' };
			const content = 'content\nmore content\nand even more content';
			const converter = frontMatterConverter();
			await converter.stringify(file as unknown as LoomFile, { data, content });
			expect(file.lines).toStrictEqual(['---', 'key: value', 'cotton: coding', '---', '', 'content', 'more content', 'and even more content']);
		});

		test('stringify with content only', async () => {
			const file = new FileMock();
			const content = 'content';
			const converter = frontMatterConverter();
			await converter.stringify(file as unknown as LoomFile, content);
			expect(file.lines).toStrictEqual(['---', '---', '', 'content']);
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

		test('addNewLine adds new line', async () => {
			const testString = 'test';
			expect(ensureNewLine(testString)).toBe('test\n');
		});

		test('addNewLine does not add new line if file already end with new line', async () => {
			const testString = 'test\n';
			expect(ensureNewLine(testString)).toBe('test\n');
		});

		test('writeToFile writes content', async () => {
			const mockFile = new FileMock();
			const file = (mockFile) as unknown as LoomFile;
			const matter = 'key: value';
			const content = 'content with bla bal bla lines';
			await writeToFile(file, matter, content);
			expect(mockFile.lines).toEqual(['---', 'key: value', '---', '', 'content with bla bal bla lines']);
		});

		test('writeToFile writes with empty data', async () => {
			const mockFile = new FileMock();
			const file = (mockFile) as unknown as LoomFile;
			const content = '#headline\ncontent with bla bal bla lines';
			await writeToFile(file, undefined, content);
			expect(mockFile.lines).toEqual(['---', '---', '', '#headline', 'content with bla bal bla lines']);
		});

		test('stringifyJson returns empty string', async () => {
			const file = (new FileMock()) as unknown as LoomFile;
			const data1 = null;
			expect(stringifyJson(file, data1)).resolves.toBe('');
			const data2 = undefined;
			expect(stringifyJson(file, data2)).resolves.toBe('');
		});

		test('stringifyJson returns yaml with newline', async () => {
			const file = (new FileMock()) as unknown as LoomFile;
			const data = { key: 'value', some: 'other' };
			console.log(await stringifyJson(file, data));
			expect(stringifyJson(file, data)).resolves.toBe('key: value\nsome: other\n');
		});

		test('stringifyJson returns json with new line', async () => {
			const file = (new FileMock(['---json', '---'])) as unknown as LoomFile;
			const data = { key: 'value', some: 'other' };
			expect(stringifyJson(file, data)).resolves.toBe('{"key":"value","some":"other"}');
		});

	});
});