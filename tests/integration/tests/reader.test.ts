import { describe, expect, test } from 'vitest';
import LoomIO from '@loom-io/core';

function createEditor(testFile: string) {
	const file = LoomIO.file(testFile);
	return file.reader();
}

const TEST_DIR = 'test-data' as const;

describe('Editor', () => {


	test('raw', async () => {
		const testFile = `${TEST_DIR}/editor.md`;
		const reader = await createEditor(testFile);
		expect(reader.raw).toBeDefined();
		reader.close();
	});


	describe('search', () => {
		test('find first value', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchFirst('sure');
			expect(result).toBeDefined();
			reader.close();
		});

		test('has next value', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchFirst('some');
			expect(result).toBeDefined();
			const hasNext = await result?.hasNext();
			expect(hasNext).toBe(true);
			reader.close();
		});

		test('has no next value', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchFirst('opportunity');
			expect(result).toBeDefined();
			expect(await result?.hasNext()).toBe(false);
			reader.close();
		});

		test('find next value', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchFirst('some');
			expect(result).toBeDefined();
			const resultValue = result!.meta;
			const next = await result?.next();
			expect(next).toBeDefined();
			expect(next?.meta).not.toBe(resultValue);
			expect(next?.meta.start).toBeGreaterThan(resultValue.start);
			reader.close();
		});

		test('find all values forward', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchFirst('co');
			expect(result).toBeDefined();
			let count = 1;
			while(await result!.hasNext()) {
				
				await result!.next();
				expect(result).toBeDefined();
				count++;
			}
			//find 5 with small letter, search is case insensitive
			expect(count).toBe(5);
			expect(await result!.next()).toBeUndefined();
			reader.close();
		});

		test('find no value', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const searchValue = 'surely not';
			const result = await reader.searchFirst(searchValue);
			expect(result).toBeUndefined();
			const result2 = await reader.searchLast(searchValue);
			expect(result2).toBeUndefined();
			reader.close();
		});

		test('has prev value', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchLast('it');
			expect(result).toBeDefined();
			const hasPrev = await result?.hasPrev();
			expect(hasPrev).toBe(true);
			reader.close();
		});

		test('has no prev value', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchLast('itself');
			expect(result).toBeDefined();
			const hasPrev = await result?.hasPrev();
			expect(hasPrev).toBe(false);
			reader.close();
		});

		test('find last value', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchLast('some');
			expect(result).toBeDefined();
			expect(result?.meta.start).toBeGreaterThan(1000);
			reader.close();
		});

		test('find previous value', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchLast('some');
			expect(result).toBeDefined();
			const resultValue = result!.meta;
			const prev = await result?.prev();
			expect(prev).toBeDefined();
			expect(prev?.meta).not.toBe(resultValue);
			expect(prev?.meta.start).toBeLessThan(resultValue.start);
			reader.close();
		});

		test('find all values reverse', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchLast('in');
			expect(result).toBeDefined();
			
			let count = 1;
			while(await result?.hasPrev()) {
				await result!.prev();
				expect(result).toBeDefined();
				count++;
			}
			expect(count).toBe(17);
			expect(result?.prev()).resolves.toBeUndefined();
			reader.close();
		});

	});

	describe('line read', () => {

		test('read first line as string', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.firstLine();
			expect(result).toBeDefined();
			const line = await result?.read('utf8');
			expect(line).toBeDefined();
			expect(line).toBeTypeOf('string');
			expect(line).toBe('---');
			reader.close();
		});

		test('read line', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.firstLine();
			expect(result).toBeDefined();
			const line = await result?.read();
			expect(line).toBeDefined();
			expect(line).toBeInstanceOf(Buffer);
			reader.close();
		});

		test('get next line', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.firstLine();
			expect(result).toBeDefined();
			await result.next();
			expect(result).toBeDefined();
			expect(result.read('utf8')).resolves.toBe('createdAt: 2020-12-17');
			reader.close();
		});

		test('read till last lines', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.firstLine();
			expect(result).toBeDefined();
			let count = 0;
			while(await result.hasNext()) {
				const line = await result.read('utf8');
				if(line === '---') {
					count++;
				}
				await result.next();
			}
			expect(result.read('utf8')).resolves.toBe('### EOF');
			expect(count).toBe(2);
			expect(result.next()).resolves.toBeUndefined();
			reader.close();
		});

		test('read last line', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.lastLine();
			expect(result).toBeDefined();
			const line = await result.read();
			expect(line).toBeDefined();
			expect(line).toBeInstanceOf(Buffer);
			reader.close();
		});

		test('read last line as string', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.lastLine();
			expect(result).toBeDefined();
			const line = await result.read('utf8');
			expect(line).toBeDefined();
			expect(line).toBeTypeOf('string');
			expect(line).toBe('### EOF');
			reader.close();
		});

		test('get prev line', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.lastLine();
			expect(result).toBeDefined();
			await result.prev();
			expect(result).toBeDefined();
			expect(result.read('utf8')).resolves.toContain('e some ideas in my mind, but not sure if they');
			reader.close();
		});

		test('read till first lines', async () => {
			const testFile = `${TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.lastLine();
			expect(result).toBeDefined();

			let count = 0;
			while(await result.hasPrev()) {
				await result.prev();
				const line = await result.read('utf8');
				if(line === '---') {
					count++;
				}
			}
			expect(result.read('utf8')).resolves.toBe('---');
			expect(result.prev()).resolves.toBeUndefined();
			expect(count).toBe(2);
			reader.close();
		});

		test('read empty file', async () => {
			const testFile = `${TEST_DIR}/empty.txt`;
			const reader = await createEditor(testFile);
			const resultForward = await reader.firstLine();
			expect(resultForward).toBeDefined();
			const line = await resultForward?.read('utf8');
			expect(line).toBe('');
			const resultBackward = await reader.lastLine();
			expect(resultBackward).toBeDefined();
			const line2 = await resultBackward?.read('utf8');
			expect(line2).toBe('');
			reader.close();
		});

		test('read file with only one line', async () => {
			const fileContentLength = 591;
			const testFile = `${TEST_DIR}/line.txt`;
			const reader = await createEditor(testFile);
			const resultForward = await reader.firstLine();
			expect(resultForward).toBeDefined();
			const line = await resultForward?.read('utf8');
			expect(line.length).toBe(fileContentLength);
			expect(line).toContain('Lorem ipsum');
			const resultBackward = await reader.lastLine();
			expect(resultBackward).toBeDefined();
			const line2 = await resultBackward?.read('utf8');
			expect(line2).toContain('Lorem ipsum');
			expect(line2.length).toBe(fileContentLength);
			reader.close();
		});

	});
});