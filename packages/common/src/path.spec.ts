import { describe, test, expect } from 'vitest';
import { getFirstElementsOfPath, getPathDepth, removePrecedingAndTrailingSlash, splitTailingPath } from './path';


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

	test('getPathDepth', async () => {
		expect(getPathDepth('/test/some/slashing/')).toBe(3);
		expect(getPathDepth('/test/some/slashing')).toBe(3);
		expect(getPathDepth('test/some/slashing/')).toBe(3);
		expect(getPathDepth('test/some/slashing')).toBe(3);
		expect(getPathDepth('/')).toBe(0);
		expect(getPathDepth('')).toBe(0);
		expect(getPathDepth('/someFile.txt')).toBe(1);
		expect(getPathDepth('someFile.txt')).toBe(1);
		expect(getPathDepth('/test/some/slashing/long/with/file.txt')).toBe(6);
	});

	test('getFirstElementsOfPath', async () => {
		expect(getFirstElementsOfPath('/test/some/slashing/', 3)).toBe('/test/some/slashing/');
		expect(getFirstElementsOfPath('/test/some/slashing', 2)).toBe('/test/some');
		expect(getFirstElementsOfPath('test/some/slashing/', 2)).toBe('test/some/');
		expect(getFirstElementsOfPath('test/some/slashing', 3)).toBe('test/some/slashing');
		expect(getFirstElementsOfPath('/test/some/slashing/', 1)).toBe('/test/');
		expect(getFirstElementsOfPath('/test/some/slashing', 1)).toBe('/test');
		expect(getFirstElementsOfPath('test/some/slashing/', 1)).toBe('test/');
		expect(getFirstElementsOfPath('test/some/slashing', 1)).toBe('test');
		expect(getFirstElementsOfPath('/test/some/slashing/', 0)).toBe('/');
		expect(getFirstElementsOfPath('/test/some/slashing', 0)).toBe('/');
		expect(getFirstElementsOfPath('test/some/slashing/', 0)).toBe('/');
		expect(getFirstElementsOfPath('test/some/slashing', 0)).toBe('/');
	});

});