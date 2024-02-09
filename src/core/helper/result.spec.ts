import { describe, test, expect, beforeAll } from 'vitest';
import { SearchResult } from './result';
import { TextItemList } from './textItemList';
import { ReaderInternal } from '../editor';
import { faker } from '@faker-js/faker';


class MockReader implements ReaderInternal {

	async searchFirst(value: string, start: number = 0): Promise<SearchResult | undefined> {
		const item = new TextItemList({ start, end: start + value.length});
		const nextItem = new TextItemList({ start: start+value.length*2, end: start+value.length*3});
		item.add(nextItem);
		return new SearchResult(item, Buffer.from(value), this);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async loopForward(value: Buffer, first: number, last: number): Promise<TextItemList | undefined> {
		return new TextItemList({ start: first, end: first+value.length});
	}

	async loopReverse(value: Buffer, first: number, last: number): Promise<TextItemList | undefined> {
		return new TextItemList({ start: last-value.length, end: last});
	}

	async searchLast(value: string, start: number = 100000): Promise<SearchResult | undefined> {
		const item = new TextItemList({ start: start-value.length, end: start});
		const prevItem = new TextItemList({ start: start-value.length*3, end: start-value.length*2});
		item.add(prevItem);
		return new SearchResult(item, Buffer.from(value), this);
	}

	getSizeInBytes(): Promise<number> {
		return Promise.resolve(100000);
	}

	async read(start: number, length: number): Promise<Buffer> {
		const lorem = faker.lorem.paragraphs(10);
		const part = lorem.substring(start, start+length);
		return Buffer.from(part);
	}

	async readAsString(start: number, length: number): Promise<string> {
		const lorem = faker.lorem.paragraphs(10);
		const part = lorem.substring(start, start+length);
		return part;
	
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
		const result = new SearchResult(item, Buffer.from('test'), reader);
		expect(result).toBeDefined();
	});

	test('next', async () => {
		const result = await reader.searchFirst('test');
		const next = await result?.next();
		expect(next).toBeDefined();
		expect(next).toBeInstanceOf(SearchResult);
	});

	test('prev', async () => {
		const result = await reader.searchLast('test');
		const prev = await result?.prev();
		expect(prev).toBeDefined();
		expect(prev).toBeInstanceOf(SearchResult);
	});

	test('searchValue', async () => {
		const result = await reader.searchFirst('test');
		expect(result?.searchValue.toString()).toBe('test');
	});

});