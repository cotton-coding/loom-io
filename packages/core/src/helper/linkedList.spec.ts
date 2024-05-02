import { describe, expect, test } from 'vitest';
import { ListItem } from './linkedList.js';

describe('LinkedList', () => {

	test('set content', () => {
		const list0 = new ListItem(0);
		const list1 = new ListItem(1);
		expect(list0.content).toBe(0);
		expect(list1.content).toBe(1);
		list0.addAfter(list1);
		expect(list0.next()?.content).toBe(1);
	});

	test('link addAfter', () => {
		const list = new ListItem(0);
		const list2 = new ListItem(1);
		list.addAfter(list2);
		expect(list.next()).toBe(list2);
		expect(list2.prev()).toBe(list);
	});

	test('link addBefore', () => {
		const list = new ListItem(0);
		const list2 = new ListItem(1);
		list.addBefore(list2);
		expect(list.prev()).toBe(list2);
		expect(list2.next()).toBe(list);
	});

	test('link remove', () => {
		const list = new ListItem(0);
		const list2 = new ListItem(1);
		const list3 = new ListItem(2);
		list.addAfter(list2);
		list2.addAfter(list3);
		list2.remove();
		expect(list.next()).toBe(list3);
		expect(list3.prev()).toBe(list);
	});

	test('link getFirst', () => {
		const list = new ListItem(0);
		const list2 = new ListItem(1);
		const list3 = new ListItem(2);
		list.addAfter(list2);
		list2.addAfter(list3);
		expect(list3.getFirst()).toBe(list);
	});

	test('link getLast', () => {
		const list = new ListItem(0);
		const list2 = new ListItem(1);
		const list3 = new ListItem(2);
		list.addAfter(list2);
		list2.addAfter(list3);
		expect(list.getLast()).toBe(list3);
	});

});