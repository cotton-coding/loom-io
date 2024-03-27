import { describe, test, expect } from 'vitest';
import LoomIO, {isDirectory, isFile} from '../src/bundle';

describe('minimal export test', async () => {

	test('exports', async () => {
		expect(LoomIO).toBeDefined();
	});

	test('isDirectory', async () => {
		expect(isDirectory).toBeDefined();
		expect(isDirectory).toBeInstanceOf(Function);
	});

	test('isFile', async () => {
		expect(isFile).toBeDefined();
		expect(isFile).toBeInstanceOf(Function);
	});

});
