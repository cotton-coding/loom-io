import { describe, test, expect } from 'vitest';
import { isMinioException } from './typechecks.js';
import { } from 'minio';

class MinioLikeException extends Error{
	code: string;
	message: string;
}


describe('typechecks', () => {
	test('isMinioException', () => {
		expect(isMinioException(new Error('test'))).toBe(false);
		expect(isMinioException({})).toBe(false);
		expect(isMinioException({ code: 'test' })).toBe(false);
		expect(isMinioException({ message: 'test' })).toBe(false);
		expect(isMinioException({ code: 'test', message: 'test' })).toBe(false);
		expect(isMinioException(new MinioLikeException('test'))).toBe(true);
	});
});