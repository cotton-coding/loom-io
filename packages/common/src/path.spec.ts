import { describe, test, expect } from 'vitest';
import { addPrecedingAndTailingSlash, getUniqSegmentsOfPath, getSegmentsOfPath, getPathDepth, removePrecedingAndTrailingSlash, splitTailingPath, removePrecedingSlash, removeTailingSlash } from './path.js';
import { normalize } from 'node:path';


describe('path utils', async () => {

	test('removePrecedingSlash', async () => {

		expect(removePrecedingSlash(normalize('/test'))).toBe(normalize('test'))
		expect(removePrecedingSlash(normalize('test'))).toBe(normalize('test'))
		expect(removePrecedingSlash(normalize('/test/'))).toBe(normalize('test/'))
		expect(removePrecedingSlash(normalize('test/'))).toBe(normalize('test/'))
		expect(removePrecedingSlash(normalize('/'))).toBe('')
		expect(removePrecedingSlash('')).toBe('')
		expect(removePrecedingSlash(normalize('/test/some/slashing/'))).toBe(normalize('test/some/slashing/'))
	});

	test('removeTailingSlash', async () => {

		expect(removeTailingSlash(normalize('/test'))).toBe(normalize('/test'))
		expect(removeTailingSlash(normalize('test'))).toBe(normalize('test'))
		expect(removeTailingSlash(normalize('/test/'))).toBe(normalize('/test'))
		expect(removeTailingSlash(normalize('test/'))).toBe(normalize('test'))
		expect(removeTailingSlash(normalize('/'))).toBe('')
		expect(removeTailingSlash('')).toBe('')
		expect(removeTailingSlash(normalize('/test/some/slashing/'))).toBe(normalize('/test/some/slashing'))


		
	});


	test('removePresentedAndTrailingSlash', async () => {
		

		expect(removePrecedingAndTrailingSlash(normalize('/test/'))).toBe(normalize('test'));
		expect(removePrecedingAndTrailingSlash(normalize('/test'))).toBe(normalize('test'));
		expect(removePrecedingAndTrailingSlash(normalize('test/'))).toBe(normalize('test'));
		expect(removePrecedingAndTrailingSlash(normalize('test'))).toBe(normalize('test'));
		expect(removePrecedingAndTrailingSlash(normalize('/'))).toBe('');
		expect(removePrecedingAndTrailingSlash('')).toBe('');
		expect(removePrecedingAndTrailingSlash(normalize('/test/some/slashing/'))).toBe(normalize('test/some/slashing'));

	});

	test('addPrecedingAndTailingSlash', async () => {
		expect(addPrecedingAndTailingSlash(normalize('test'))).toBe(normalize('/test/'));
		expect(addPrecedingAndTailingSlash(normalize('/test'))).toBe(normalize('/test/'));
		expect(addPrecedingAndTailingSlash(normalize('test/'))).toBe(normalize('/test/'));
		expect(addPrecedingAndTailingSlash(normalize('/test/'))).toBe(normalize('/test/'));
		expect(addPrecedingAndTailingSlash(normalize('/'))).toBe(normalize('/'));
		expect(addPrecedingAndTailingSlash('')).toBe(normalize('/'));
		expect(addPrecedingAndTailingSlash(normalize('/test/some/slashing'))).toBe(normalize('/test/some/slashing/'));

	});

	test('splitTailingPath', async () => {



		expect(splitTailingPath(normalize('/test/some/slashing/'))).toEqual([normalize('/test/some/'), normalize('slashing/')]);
		expect(splitTailingPath(normalize('/test/some/slashing'))).toEqual([normalize('/test/some/'), normalize('slashing')]);
		expect(splitTailingPath(normalize('test/some/slashing/'))).toEqual([normalize('test/some/'), normalize('slashing/')]);
		expect(splitTailingPath(normalize('test/some/slashing'))).toEqual([normalize('test/some/'), normalize('slashing')]);
		expect(splitTailingPath(normalize('/'))).toEqual([normalize('/'), undefined]);
		expect(splitTailingPath('')).toEqual([normalize('/'), undefined]);
		expect(splitTailingPath(normalize('/someFile.txt'))).toEqual([normalize('/'), normalize('someFile.txt')]);
		expect(splitTailingPath(normalize('someFile.txt'))).toEqual([normalize('/'), normalize('someFile.txt')]);
		expect(splitTailingPath(normalize('/test/some/slashing/long/with/file.txt'))).toEqual([normalize('/test/some/slashing/long/with/'), normalize('file.txt')]);



	});

	test('getPathDepth', async () => {
		expect(getPathDepth(normalize('/test/some/slashing/'))).toBe(3);
		expect(getPathDepth(normalize('/test/some/slashing'))).toBe(3);
		expect(getPathDepth(normalize('test/some/slashing/'))).toBe(3);
		expect(getPathDepth(normalize('test/some/slashing'))).toBe(3);
		expect(getPathDepth(normalize('/'))).toBe(0);
		expect(getPathDepth('')).toBe(0);
		expect(getPathDepth(normalize('/someFile.txt'))).toBe(1);
		expect(getPathDepth(normalize('someFile.txt'))).toBe(1);
		expect(getPathDepth(normalize('/test/some/slashing/long/with/file.txt'))).toBe(6);
		expect(getPathDepth(normalize('./relative'))).toBe(1);
		expect(getPathDepth(normalize('./relative/'))).toBe(1);
		expect(getPathDepth(normalize('./relative/cotton'))).toBe(2);
		expect(getPathDepth(normalize('./relative/cotton/'))).toBe(2);
		expect(getPathDepth(normalize('./relative/cotton/programming'))).toBe(3);
		expect(getPathDepth(normalize('./relative/cotton/programming/'))).toBe(3);
		expect(getPathDepth(normalize('.hidden'))).toBe(1);
		expect(getPathDepth(normalize('.hidden/'))).toBe(1);
		expect(getPathDepth(normalize('.hidden/file'))).toBe(2);
		expect(getPathDepth(normalize('.hidden/file/'))).toBe(2);

	});

	test('getSegmentsOfPath', async () => {
		expect(getSegmentsOfPath(normalize('/test/some/slashing/'), 3)).toBe(normalize('/test/some/slashing/'));
		expect(getSegmentsOfPath(normalize('/test/some/slashing'), 2)).toBe(normalize('/test/some/'));
		expect(getSegmentsOfPath(normalize('test/some/slashing/'), 2)).toBe(normalize('test/some/'));
		expect(getSegmentsOfPath(normalize('test/some/slashing'), 3)).toBe(normalize('test/some/slashing'));
		expect(getSegmentsOfPath(normalize('/test/some/slashing/'), 1)).toBe(normalize('/test/'));
		expect(getSegmentsOfPath(normalize('/test/some/slashing'), 1)).toBe(normalize('/test/'));
		expect(getSegmentsOfPath(normalize('test/some/slashing/'), 1)).toBe(normalize('test/'));
		expect(getSegmentsOfPath(normalize('test/some/slashing'), 1)).toBe(normalize('test/'));
		expect(getSegmentsOfPath(normalize('/cotton/slashing/'), 0)).toBe(normalize('/'));
		expect(getSegmentsOfPath(normalize('/test/some/slashing'), 0)).toBe(normalize('/'));
		expect(getSegmentsOfPath(normalize('test/some/slashing/'), 0)).toBe(normalize('/'));
		expect(getSegmentsOfPath(normalize('test/some/slashing'), 0)).toBe(normalize('/'));
		expect(getSegmentsOfPath(normalize('../../cotton-going-up/loop'), 1)).toBe(normalize('../'));
		expect(getSegmentsOfPath(normalize('./relative/'), 1)).toBe(normalize('./relative/'));
		expect(getSegmentsOfPath(normalize('./relative/cotton'), 1)).toBe(normalize('./relative/'));
		expect(getSegmentsOfPath(normalize('./relative/cotton'), 2)).toBe(normalize('./relative/cotton'));
		expect(getSegmentsOfPath(normalize('.hidden'), 1)).toBe(normalize('.hidden'));
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
		].map(normalize);

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
		].map(normalize));

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
		].map(normalize));

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
		].map(normalize));

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
		].map(normalize));
	});

});