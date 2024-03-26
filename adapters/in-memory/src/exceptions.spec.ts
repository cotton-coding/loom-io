import { describe, test, expect } from 'vitest';
import { AlreadyExistsException, NotFoundException } from './exceptions';
import { MEMORY_TYPE } from './definitions';

describe('exceptions', () => {
	test('NotFoundException with root', () => {
		const error = new NotFoundException('test', { $type: MEMORY_TYPE.ROOT, content: [] });
		expect(error.message).toBe('Could not find test');
		expect(error.last).toEqual({ $type: MEMORY_TYPE.ROOT, content: [] });
		expect(error.depth).toBe(0);
	});

	test('NotFoundException with directory', () => {
		const error = new NotFoundException('test', { $type: MEMORY_TYPE.DIRECTORY, name:'test', content: [] });
		expect(error.message).toBe('Could not find test');
		expect(error.last).toEqual({ $type: MEMORY_TYPE.DIRECTORY, name: 'test', content: [] });
		expect(error.depth).toBe(0);
	});

	test('AlreadyExistsException with root', () => {
		const error = new AlreadyExistsException('test', { $type: MEMORY_TYPE.ROOT, content: [] });
		expect(error.message).toBe('Already exists test');
		expect(error.ref).toEqual({ $type: MEMORY_TYPE.ROOT, content: [] });
	});

	test('AlreadyExistsException with directory', () => {
		const error = new AlreadyExistsException('test', { $type: MEMORY_TYPE.DIRECTORY, name:'test', content: [] });
		expect(error.message).toBe('Already exists test');
		expect(error.ref).toEqual({ $type: MEMORY_TYPE.DIRECTORY, name: 'test', content: [] });
	});
});