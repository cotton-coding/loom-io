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

	getDefaultChunkSize(): number {
		return this.chunkSize;
	}

	unwrappedCalcChunkSize (
		...values: Parameters<Editor['calcChunkSize']>
	): ReturnType<Editor['calcChunkSize']> {
		return this.calcChunkSize(...values);
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

	test('from', async () => {
		const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
		const dir = new Directory(dirname(testFile));
		const file = new LoomFile(dir, basename(testFile));
		const reader: Reader = await Editor.from(file);
		expect(reader).toBeInstanceOf(Editor);
		reader.close();
	});

	test('raw', async () => {
		const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
		const reader = await createEditor(testFile);
		expect(reader.raw).toBeDefined();
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
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const searchValue = 'surely not';
			const result = await reader.searchFirst(searchValue);
			expect(result).toBeUndefined();
			const result2 = await reader.searchLast(searchValue);
			expect(result2).toBeUndefined();
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
			expect(result?.prev()).resolves.toBeUndefined();
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

			test('calcChunkSize', async () => {
				const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
				const editor = await TestEditor.fromPath(testFile);
				const valueLength = 10;
				const chunkSize = editor.unwrappedCalcChunkSize(valueLength);
				expect(chunkSize).toBeDefined();
				expect(chunkSize).toBe(editor.getDefaultChunkSize());
				expect(chunkSize).toBeGreaterThan(valueLength);
				const largeValue = editor.unwrappedCalcChunkSize(5000+chunkSize);
				expect(largeValue).toBeDefined();
				expect(largeValue).toBeGreaterThan(5000);
				expect(largeValue).toBeGreaterThan(chunkSize);
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
				expect(p!.position).toBe(cur - (chunkSize + Math.floor(valueLength/2)));
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
				expect(p!.length).toBe(cur - min + Math.floor(valueLength/2));
			});


		});

	});

	describe('line read', () => {

		test('read first line as string', async () => {
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
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
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.firstLine();
			expect(result).toBeDefined();
			const line = await result?.read();
			expect(line).toBeDefined();
			expect(line).toBeInstanceOf(Buffer);
			reader.close();
		});

		test('get next line', async () => {
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.firstLine();
			expect(result).toBeDefined();
			await result.next();
			expect(result).toBeDefined();
			expect(result.read('utf8')).resolves.toBe('createdAt: 2020-12-17');
			reader.close();
		});

		test('read till last lines', async () => {
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
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
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.lastLine();
			expect(result).toBeDefined();
			const line = await result.read();
			expect(line).toBeDefined();
			expect(line).toBeInstanceOf(Buffer);
			reader.close();
		});

		test('read last line as string', async () => {
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
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
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
			const reader = await createEditor(testFile);
			const result = await reader.lastLine();
			expect(result).toBeDefined();
			await result.prev();
			expect(result).toBeDefined();
			expect(result.read('utf8')).resolves.toContain('e some ideas in my mind, but not sure if they');
			reader.close();
		});

		test('read till first lines', async () => {
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/editor.md`;
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
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/empty.txt`;
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
			const testFile = `${TestFilesystemHelper.STATIC_TEST_DIR}/line.txt`;
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