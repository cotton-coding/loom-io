import { describe, expect, test } from 'vitest';
import frontMatterConverter from './lib.js';
import { FileMock } from '../test/mocks.js';
import { LoomFile } from '@loom-io/core';

describe('test library exports', async () => {

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