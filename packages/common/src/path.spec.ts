import { describe, test, expect } from 'vitest';
import { removePrecedingAndTrailingSlash, splitTailingPath } from './path';


describe('path utils', async () => {
	test('removePresentedAndTrailingSlash', async () => {
		expect(removePrecedingAndTrailingSlash('/test/')).toBe('test');
		expect(removePrecedingAndTrailingSlash('/test')).toBe('test');
		expect(removePrecedingAndTrailingSlash('test/')).toBe('test');
		expect(removePrecedingAndTrailingSlash('test')).toBe('test');
		expect(removePrecedingAndTrailingSlash('/')).toBe('');
		expect(removePrecedingAndTrailingSlash('')).toBe('');
		expect(removePrecedingAndTrailingSlash('/test/some/slashing/')).toBe('test/some/slashing');
	});

	test('splitTailingPath', async () => {
		expect(splitTailingPath('/test/some/slashing/')).toEqual(['/test/some/', 'slashing/']);
		expect(splitTailingPath('/test/some/slashing')).toEqual(['/test/some/', 'slashing']);
		expect(splitTailingPath('test/some/slashing/')).toEqual(['test/some/', 'slashing/']);
		expect(splitTailingPath('test/some/slashing')).toEqual(['test/some/', 'slashing']);
		expect(splitTailingPath('/someFile.txt')).toEqual(['/', 'someFile.txt']);
		expect(splitTailingPath('someFile.txt')).toEqual(['/', 'someFile.txt']);
		expect(splitTailingPath('/')).toEqual(['/', undefined]);
		expect(splitTailingPath('')).toEqual(['/', undefined]);
	});
});