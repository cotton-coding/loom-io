import { describe, test, expect, beforeAll } from 'vitest';
import { LineResult, SearchResult } from './result';
import { TextItemList } from './textItemList';
import { ReaderInternal } from '../editor';
import { faker } from '@faker-js/faker';
import exp from 'constants';


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


describe('SearchResult', () => {

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

describe('LineResult', () => {

	let reader: MockReader;

	beforeAll(() => {
		reader = new MockReader();
	});

	test('constructor', async () => {
		const item = new TextItemList({ start: 0, end: 10});
		const result = new LineResult(item, Buffer.from('\r\n'), reader);
		expect(result).toBeDefined();
	});

	test('patchPrevItems', async () => {
		const item0 = new TextItemList({ start: 6, end: 7});
		const item1 = new TextItemList({ start: 30, end: 31});
		const item2 = new TextItemList({ start: 89, end: 90});
		const item3 = new TextItemList({ start: 100, end: 200});
		item0.add(item1);
		item1.add(item2);
		item2.add(item3);
		new LineResult(item3, Buffer.from('\n'), reader);
		expect(item0.start).toBe(7);
		expect(item0.end).toBe(31);
		expect(item1.start).toBe(31);
		expect(item1.end).toBe(90);
		expect(item2.start).toBe(90);
		expect(item2.end).toBe(100);
		expect(item3.start).toBe(100);
		expect(item3.end).toBe(200);
	});

	test('patchNextItems', async () => {
		const item1 = new TextItemList({ start: 0, end: 10});
		const item2 = new TextItemList({ start: 74, end: 75});
		const item3 = new TextItemList({ start: 75, end: 76});
		const item4 = new TextItemList({ start: 89, end: 90});
		item3.add(item4);
		item1.add(item2);
		item2.add(item3);
		new LineResult(item1, Buffer.from('test'), reader);
		expect(item1.start).toBe(0);
		expect(item1.end).toBe(10);
		expect(item2.start).toBe(10);
		expect(item2.end).toBe(75);
		expect(item3.start).toBe(75);
		expect(item3.end).toBe(76);
		expect(item4.start).toBe(76);
		expect(item4.end).toBe(90);

	});

	test('hasNext', async () => {
		const item1 = new TextItemList({ start: 0, end: 10});
		const item2 = new TextItemList({ start: 10, end: 20});
		item1.add(item2);
		const lineResult = new SearchResult(item1, Buffer.from('test'), reader);
		const hasNext = await lineResult.hasNext();
		expect(hasNext).toBe(true);
	});

});