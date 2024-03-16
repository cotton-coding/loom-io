import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { removePresentedAndTrailingSlash } from './path';


describe('path utils', async () => {
	test('removePresentedAndTrailingSlash', async () => {
		expect(removePresentedAndTrailingSlash('/test/')).toBe('test');
		expect(removePresentedAndTrailingSlash('/test')).toBe('test');
		expect(removePresentedAndTrailingSlash('test/')).toBe('test');
		expect(removePresentedAndTrailingSlash('test')).toBe('test');
		expect(removePresentedAndTrailingSlash('/')).toBe('');
		expect(removePresentedAndTrailingSlash('')).toBe('');
		expect(removePresentedAndTrailingSlash('/test/some/slashing/')).toBe('test/some/slashing');
	});
});