import { describe, test, expect } from 'vitest';
import { addPrecedingAndTailingSlash, getUniqSegmentsOfPath, getSegmentsOfPath, getPathDepth, removePrecedingAndTrailingSlash, splitTailingPath, removePrecedingSlash, removeTailingSlash } from './path';

describe('path utils', async () => {

	test('removePrecedingSlash', async () => {
		expect(removePrecedingSlash('/test')).toBe('test');
		expect(removePrecedingSlash('test')).toBe('test');
		expect(removePrecedingSlash('/')).toBe('');
		expect(removePrecedingSlash('')).toBe('');
		expect(removePrecedingSlash('/test/some/slashing')).toBe('test/some/slashing');
	});

	test('removeTailingSlash', async () => {
		expect(removeTailingSlash('/test/')).toBe('/test');
		expect(removeTailingSlash('/test')).toBe('/test');
		expect(removeTailingSlash('test/')).toBe('test');
		expect(removeTailingSlash('test')).toBe('test');
		expect(removeTailingSlash('/')).toBe('');
		expect(removeTailingSlash('')).toBe('');
		expect(removeTailingSlash('/test/tailing/sla_sigs-d/')).toBe('/test/tailing/sla_sigs-d');
	});


	test('removePresentedAndTrailingSlash', async () => {
		expect(removePrecedingAndTrailingSlash('/test/')).toBe('test');
		expect(removePrecedingAndTrailingSlash('/test')).toBe('test');
		expect(removePrecedingAndTrailingSlash('test/')).toBe('test');
		expect(removePrecedingAndTrailingSlash('test')).toBe('test');
		expect(removePrecedingAndTrailingSlash('/')).toBe('');
		expect(removePrecedingAndTrailingSlash('')).toBe('');
		expect(removePrecedingAndTrailingSlash('/test/some/slashing/')).toBe('test/some/slashing');
	});

	test('addPrecedingAndTailingSlash', async () => {
		expect(addPrecedingAndTailingSlash('test')).toBe('/test/');
		expect(addPrecedingAndTailingSlash('/test')).toBe('/test/');
		expect(addPrecedingAndTailingSlash('test/')).toBe('/test/');
		expect(addPrecedingAndTailingSlash('/test/')).toBe('/test/');
		expect(addPrecedingAndTailingSlash('/')).toBe('/');
		expect(addPrecedingAndTailingSlash('')).toBe('/');
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

	test('getSegmentsOfPath', async () => {
		expect(getSegmentsOfPath('/test/some/slashing/', 3)).toBe('/test/some/slashing/');
		expect(getSegmentsOfPath('/test/some/slashing', 2)).toBe('/test/some/');
		expect(getSegmentsOfPath('test/some/slashing/', 2)).toBe('test/some/');
		expect(getSegmentsOfPath('test/some/slashing', 3)).toBe('test/some/slashing');
		expect(getSegmentsOfPath('/test/some/slashing/', 1)).toBe('/test/');
		expect(getSegmentsOfPath('/test/some/slashing', 1)).toBe('/test/');
		expect(getSegmentsOfPath('test/some/slashing/', 1)).toBe('test/');
		expect(getSegmentsOfPath('test/some/slashing', 1)).toBe('test/');
		expect(getSegmentsOfPath('/cotton/slashing/', 0)).toBe('/');
		expect(getSegmentsOfPath('/test/some/slashing', 0)).toBe('/');
		expect(getSegmentsOfPath('test/some/slashing/', 0)).toBe('/');
		expect(getSegmentsOfPath('test/some/slashing', 0)).toBe('/');
		expect(getSegmentsOfPath('../../cotton-going-up/loop', 1)).toBe('../');
		expect(getSegmentsOfPath('./relative/', 1)).toBe('./relative/');
		expect(getSegmentsOfPath('./relative/cotton', 1)).toBe('./relative/');
		expect(getSegmentsOfPath('./relative/cotton', 2)).toBe('./relative/cotton');
		expect(getSegmentsOfPath('.hidden', 1)).toBe('.hidden');
	});


	test('getUniqSegmentsOfPath', async () => {
		const paths = [
			'/cotton/wool/silk',
			'coding/programming/',
			'coding/with/cotton/coding',
			'/cotton/coding/is the best/',
			'/some-thing/else',
			'cotton-coding/programming',
			'cotton-coding/is_not_belong_to_trees/maybe/sourceTrees',
			'/coding/programming',
			'./some_relative_path',
			'some_relative_path',
			'.hidden/file',
			'/.hidden/at/root',
			'a/long/.with/all/_po-si-ble/&symbols/and/numbers/1234567890',
		];

		expect(getUniqSegmentsOfPath(paths, 1)).toEqual([
			'/cotton',
			'coding',
			'/some-thing',
			'cotton-coding',
			'/coding',
			'some_relative_path',
			'.hidden',
			'/.hidden',
			'a'
		]);

		expect(getUniqSegmentsOfPath(paths, 2)).toEqual([
			'/cotton/wool',
			'coding/programming',
			'coding/with',
			'/cotton/coding',
			'/some-thing/else',
			'cotton-coding/programming',
			'cotton-coding/is_not_belong_to_trees',
			'/coding/programming',
			'some_relative_path',
			'.hidden/file',
			'/.hidden/at',
			'a/long'
		]);

		expect(getUniqSegmentsOfPath(paths, 3)).toEqual([
			'/cotton/wool/silk',
			'coding/programming',
			'coding/with/cotton',
			'/cotton/coding/is the best',
			'/some-thing/else',
			'cotton-coding/programming',
			'cotton-coding/is_not_belong_to_trees/maybe',
			'/coding/programming',
			'some_relative_path',
			'.hidden/file',
			'/.hidden/at/root',
			'a/long/.with'
		]);

		expect(getUniqSegmentsOfPath(paths, 7)).toEqual([
			'/cotton/wool/silk',
			'coding/programming',
			'coding/with/cotton/coding',
			'/cotton/coding/is the best',
			'/some-thing/else',
			'cotton-coding/programming',
			'cotton-coding/is_not_belong_to_trees/maybe/sourceTrees',
			'/coding/programming',
			'some_relative_path',
			'.hidden/file',
			'/.hidden/at/root',
			'a/long/.with/all/_po-si-ble/&symbols/and'
		]);
	});

});