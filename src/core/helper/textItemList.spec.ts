import { describe, expect, test } from 'vitest';
import { TextItemList } from './textItemList';
import { DataInvalidException } from '../exceptions';
import { faker } from '@faker-js/faker';

class TestTextItemList extends TextItemList {
	public unwrapSearchAndAddBefore(item: TextItemList) {
		return this.searchAndAddBefore(item);
	}

	public unwrapSearchAndAddAfter(item: TextItemList) {
		return this.searchAndAddAfter(item);
	}

	public unwrapAddBefore(item: TextItemList) {
		return this.addBefore(item);
	}

	public unwrapAddAfter(item: TextItemList) {
		return this.addAfter(item);
	}
}

describe('LineList', () => {
	test('constructor', () => {
		const start = faker.number.int();
		const end = faker.number.int();
		const list = new TextItemList({ start, end});
		expect(list.start).toBe(start);
		expect(list.end).toBe(end);
		expect(list.length).toBe(end - start);
		expect(list.isFirst()).toBe(true);
		expect(list.isLast()).toBe(true);
	});


	test('add', () => {
		const list0 = new TextItemList({ start: 0, end: 7 });
		const list13 = new TextItemList({ start: 13, end: 20 });
		const list37 = new TextItemList({ start: 37, end: 39 });
		const list40 = new TextItemList({ start: 40, end: 42 });
		const list80 = new TextItemList({ start: 80, end: 87 });
		const list97 = new TextItemList({ start: 97, end: 137 });
		
		list37.add(list13);
		expect(list37.prev()).toBe(list13);
		list37.add(list97);
		expect(list37.next()).toBe(list97);
		list97.add(list40);
		expect(list97.prev()).toBe(list40);
		expect(list97.next()).toBe(undefined);
		expect(list97.isLast()).toBe(true);
		expect(list37.next()).toBe(list40);
		list97.add(list0);
		expect(list97.prev()).toBe(list40);
		expect(list13.prev()).toBe(list0);
		expect(list13.next()).toBe(list37);
		expect(list13.isFirst()).toBe(false);
		list0.add(list80);
		expect(list0.next()).toBe(list13);
		expect(list0.prev()).toBe(undefined);
		expect(list0.isFirst()).toBe(true);
		expect(list13.prev()).toBe(list0);
	});

	test('searchAndAddBefore via unwrap', () => {
		const list0 = new TestTextItemList({ start: 0, end: 7 });
		const list37 = new TestTextItemList({ start: 37, end: 39 });
		const list13 = new TestTextItemList({ start: 13, end: 20 });
		const list40 = new TestTextItemList({ start: 40, end: 42 });
		const list80 = new TestTextItemList({ start: 80, end: 87 });
		const list97 = new TestTextItemList({ start: 97, end: 137 });
		
		list80.unwrapSearchAndAddBefore(list13);
		expect(list80.prev()).toBe(list13);
		list80.unwrapSearchAndAddBefore(list40);
		expect(list13.next()).toBe(list40);
		expect(list80.prev()).toBe(list40);
		expect(list40.prev()).toBe(list13);
		list40.unwrapSearchAndAddBefore(list0);
		expect(list40.prev()).toBe(list13);
		expect(list13.prev()).toEqual(list0);

		expect(() => list40.unwrapSearchAndAddBefore(list97)).toThrow(DataInvalidException);
		
		list40.unwrapSearchAndAddBefore(list37);
		expect(list40.prev()).toBe(list37);
		expect(list40.next()).toBe(list80);
		expect(list37.prev()).toBe(list13);

		list80.unwrapSearchAndAddBefore(list97);
		expect(list80.next()).toBe(list97);

	});

	test('searchAndAddAfter via unwrap', () => {
		const list0 = new TestTextItemList({ start: 0, end: 7 });
		const list37 = new TestTextItemList({ start: 37, end: 39 });
		const list13 = new TestTextItemList({ start: 13, end: 20 });
		const list40 = new TestTextItemList({ start: 40, end: 42 });
		const list80 = new TestTextItemList({ start: 80, end: 87 });
		const list97 = new TestTextItemList({ start: 97, end: 137 });
		
		list13.unwrapSearchAndAddAfter(list80);
		expect(list13.next()).toBe(list80);
		list13.unwrapSearchAndAddAfter(list40);
		expect(list80.prev()).toBe(list40);
		expect(list13.next()).toBe(list40);
		expect(list40.next()).toBe(list80);
		
		list13.unwrapSearchAndAddAfter(list37);
		expect(list13.next()).toBe(list37);
		
		expect(() => list40.unwrapSearchAndAddAfter(list0)).toThrow(DataInvalidException);

		list13.unwrapSearchAndAddAfter(list0);
		expect(list13.prev()).toBe(list0);
		list40.unwrapSearchAndAddAfter(list97);
		expect(list97.prev()).toBe(list80);

	});

	test('addBefore via unwrap', () => {
		const list0 = new TestTextItemList({ start: 0, end: 7 });
		const list13 = new TestTextItemList({ start: 13, end: 20 });
		const list40 = new TestTextItemList({ start: 40, end: 42 });
		const list80 = new TestTextItemList({ start: 80, end: 87 });
		
		list80.unwrapAddBefore(list13);
		expect(list80.prev()).toBe(list13);
		list80.unwrapAddBefore(list40);
		expect(list13.next()).toBe(list40);
		expect(list80.prev()).toBe(list40);
		expect(list40.prev()).toBe(list13);
		list40.unwrapAddBefore(list0);
		expect(list40.prev()).toBe(list0);
	});

	test('addAfter via unwrap', () => {
		const list0 = new TestTextItemList({ start: 0, end: 7 });
		const list13 = new TestTextItemList({ start: 13, end: 20 });
		const list40 = new TestTextItemList({ start: 40, end: 42 });
		const list80 = new TestTextItemList({ start: 80, end: 87 });
		
		list80.unwrapAddAfter(list13);
		expect(list80.next()).toBe(list13);
		list80.unwrapAddAfter(list40);
		expect(list13.prev()).toBe(list40);
		expect(list80.next()).toBe(list40);
		expect(list40.next()).toBe(list13);
		list40.unwrapAddAfter(list0);
		expect(list40.next()).toBe(list0);
	});
});