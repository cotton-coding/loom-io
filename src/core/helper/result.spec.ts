import { describe, test, expect, beforeAll } from 'vitest';
import { Result } from './result';
import { TextItemList } from './textItemList';
import { Reader } from '../editor';
import { faker } from '@faker-js/faker';


class MockReader implements Reader {

	async search(value: string, start: number = 0): Promise<Result | undefined> {
		const item = new TextItemList({ start, end: start + value.length});
		return new Result(item, Buffer.from(value), this);
	}

	async searchLast(value: string, start: number = 100000): Promise<Result | undefined> {
		const item = new TextItemList({ start: start-value.length, end: start});
		return new Result(item, Buffer.from(value), this);
	}

	async read(start: number, length: number): Promise<Buffer> {
		const lorem = faker.lorem.paragraphs(10);
		const part = lorem.substring(start, start+length);
		return Buffer.from(part);
	}

	async close(): Promise<void> {}
}


describe('Result', () => {

	let reader: MockReader;

	beforeAll(() => {
		reader = new MockReader();
	});


	test('constructor', async () => {
		const item = new TextItemList({ start: 0, end: 10});
		const result = new Result(item, Buffer.from('test'), reader);
		expect(result).toBeDefined();
	});

	test('next', async () => {
		const result = await reader.search('test');
		const next = await result?.next();
		expect(next).toBeDefined();
		expect(next).toBeInstanceOf(Result);
	});

	test('prev', async () => {
		const result = await reader.searchLast('test');
		const prev = await result?.prev();
		expect(prev).toBeDefined();
		expect(prev).toBeInstanceOf(Result);
	});

	test('searchValue', async () => {
		const result = await reader.search('test');
		expect(result?.searchValue.toString()).toBe('test');
	});

});