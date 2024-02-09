import { describe, expect, test } from 'vitest';
import { Editor, Reader } from './editor';
import { TestFilesystemHelper } from '../../test/helpers/testFilesystemHelper';
import { dirname, basename } from 'node:path';
import { Directory } from './dir';
import { LoomFile } from './file';
import * as fs from 'node:fs/promises';
import { faker } from '@faker-js/faker';
import { TextItemList } from './helper/textItemList';

function createEditor(testFile: string) {
	const dir = new Directory(dirname(testFile));
	const file = new LoomFile(dir, basename(testFile));
	return Editor.from(file);
}

class TestEditor extends Editor {

	static async fromPath(path: string): Promise<TestEditor> {
		const dir = new Directory(dirname(path));
		const file = new LoomFile(dir, basename(path));
		const handler = await fs.open(file.path);
		return new TestEditor(file, handler);

	}

	unwrappedSearchInChunk(
		...values: Parameters<Editor['searchInChunk']>
	): ReturnType<Editor['searchInChunk']> {
		return this.searchInChunk(...values);
	}

	unwrappedConvertChunkMatchesToItems(
		...values: Parameters<Editor['convertChunkMatchesToItems']>
	): ReturnType<Editor['convertChunkMatchesToItems']> {
		return this.convertChunkMatchesToItems(...values);
	}

	unwrappedLoopReverseCalcNextChunk(
		...values: Parameters<Editor['loopReverseCalcNextChunk']>
	): ReturnType<Editor['loopReverseCalcNextChunk']>{
		return this.loopReverseCalcNextChunk(...values);
	}
}

describe('Editor', () => {
	test('constructor', async () => {
		const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
		const dir = new Directory(dirname(testFile));
		const file = new LoomFile(dir, 'test.txt');
		const reader: Reader = await Editor.from(file);
		expect(reader).toBeInstanceOf(Editor);
		reader.close();
	});


	describe('search', () => {
		test('find first value', async () => {
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchFirst('sure');
			expect(result).toBeDefined();
			reader.close();
		});

		test('has next value', async () => {
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchFirst('some');
			expect(result).toBeDefined();
			const hasNext = await result?.hasNext();
			expect(hasNext).toBe(true);
			reader.close();
		});

		test('has no next value', async () => {
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchFirst('opportunity');
			expect(result).toBeDefined();
			expect(await result?.hasNext()).toBe(false);
			reader.close();
		});

		test('find next value', async () => {
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
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
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchFirst('co');
			expect(result).toBeDefined();
			console.log(result?.meta.start);
			let count = 1;
			while(await result?.hasNext()) {
				
				await result?.next();
				expect(result).toBeDefined();
				console.log(result?.meta.start);
				count++;
			}
			console.log(Buffer.from('co'));
			console.log(Buffer.from('Co'));
			//find 5 with small letter, search is case insensitive
			expect(count).toBe(5);
			reader.close();
		});

		test('find no value', async () => {
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchFirst('surely not');
			expect(result).toBeUndefined();
			reader.close();
		});

		test('has prev value', async () => {
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchLast('it');
			expect(result).toBeDefined();
			const hasPrev = await result?.hasPrev();
			expect(hasPrev).toBe(true);
			reader.close();
		});

		test('has no prev value', async () => {
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchLast('itself');
			expect(result).toBeDefined();
			const hasPrev = await result?.hasPrev();
			expect(hasPrev).toBe(false);
			reader.close();
		});

		test('find last value', async () => {
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.searchLast('some');
			expect(result).toBeDefined();
			expect(result?.meta.start).toBeGreaterThan(1000);
			reader.close();
		});

		test('find previous value', async () => {
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
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
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
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
			reader.close();
		});


		describe('test loop and background function', () => {

			test('searchInChunk', async () => {
				const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
				const editor = await TestEditor.fromPath(testFile);
				const chunk = Buffer.from('This is a test with ab in it.');
				const value = Buffer.from('ab');
				const result = await editor.unwrappedSearchInChunk(value, chunk);
				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result).toHaveLength(1);
				expect(result[0]).toBe(20);
			});

			test('searchInChunk random strings', async () => {
				const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
				const editor = await TestEditor.fromPath(testFile);
				const chunk = Buffer.from(faker.lorem.paragraphs({min: 1000, max: 40000}));
				const value = Buffer.from(faker.date.birthdate().toString());
				const result = await editor.unwrappedSearchInChunk(value, chunk);

				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result).toHaveLength(0);

				
				const amount = faker.number.int({min: 1, max: 7});
				const positions: number[] = [];
				const quoterSize = Math.floor(chunk.length/amount);
				for(let i = 0; i < amount; i++) {
					const pos = faker.number.int({min: quoterSize*i , max: quoterSize*(i+1)});
					value.copy(chunk, pos);
					positions.push(pos);
				}

				const result2 = await editor.unwrappedSearchInChunk(value, chunk);
				expect(result2).toBeDefined();
				expect(result2).toBeInstanceOf(Array);
				expect(result2).toHaveLength(amount);

				positions.forEach((pos, i) => {
					expect(result2[i]).toBe(pos);
				});

			});


			test('convertChungMatchesToItems', async () => {
				const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
				const editor = await TestEditor.fromPath(testFile);
				const matches = [7, 13, 18, 19, 21, 58, 150, 278, 589];
				const start = faker.number.int({min: 0, max: 1000});
				const valueLength = 1;
				const item = editor.unwrappedConvertChunkMatchesToItems(matches, valueLength, start);

				expect(item).toBeDefined();
				expect(item).toBeInstanceOf(TextItemList);
				
				expect(item?.isFirstItem()).toBe(true);

				if(item === undefined) {
					throw new Error('item is undefined');
				}
				let element: TextItemList | undefined = item;
				do {
					const next = matches.shift()!;
					expect(next).toBeDefined();
					const controlValue = next + start;
					expect(element.start).toBe(controlValue);
					element = element.next();
				} while (element !== undefined);

				expect(matches.length).toBe(0);
			});

			test('loopReverseCalcPositionAndLength', async () => {
				const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
				const editor = await TestEditor.fromPath(testFile);
				const cur = faker.number.int({min: 7000, max: 8000});
				const min = faker.number.int({min: 0, max: 3000});
				const valueLength = faker.number.int({min: 10, max: 20});
				const chunkSize = faker.number.int({min: 100, max: 200});
				const p = editor.unwrappedLoopReverseCalcNextChunk(cur, chunkSize, valueLength, min);
				expect(p).toBeDefined();
				expect(p!.position).toBe(cur - (chunkSize + valueLength/2));
				expect(p!.length).toBe(chunkSize + valueLength);
			});

			test('loopReverseCalcPositionAndLength close to min', async () => {
				const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
				const editor = await TestEditor.fromPath(testFile);
				const cur = 1000;
				const min = 500;
				const valueLength = faker.number.int({min: 10, max: 20});
				const chunkSize = faker.number.int({min: 500, max: 700});
				const p = editor.unwrappedLoopReverseCalcNextChunk(cur, chunkSize, valueLength, min);
				expect(p).toBeDefined();
				expect(p!.position).toBe(min);
				expect(p!.length).toBe(cur - min + valueLength/2);
			});


		});

	});
});