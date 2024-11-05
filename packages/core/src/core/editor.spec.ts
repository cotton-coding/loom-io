import { describe, expect, test } from 'vitest';
import { Editor, Reader } from './editor.js';
import { dirname, basename } from 'node:path';
import { Directory } from './dir.js';
import { LoomFile } from './file.js';

import { faker } from '@faker-js/faker';
import { TextItemList } from '../helper/textItemList.js';
import { beforeAll } from 'vitest';
import { InMemoryAdapterHelper } from '@loom-io/test-utils';
import { SourceAdapter } from '../definitions.js';

function createEditor(adapter, testFile: string): Promise<Editor> {
  const dir = new Directory(adapter, dirname(testFile));
  const file = new LoomFile(adapter, dir, basename(testFile));
  return Editor.from(adapter, file);
}

const TEST_FILE_PATH = '/test/data/editor.md';
const TEST_TXT_FILE_PATH = '/test/data/test.txt';
const TEST_EMPTY_FILE_PATH = '/test/data/empty.txt';

class TestEditor extends Editor {

  static async fromPath(adapter: SourceAdapter, path: string): Promise<TestEditor> {
    const dir = new Directory(adapter, dirname(path));
    const file = new LoomFile(adapter, dir, basename(path));
    const handler = await adapter.openFile(file.path);
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

  let testHelper: InMemoryAdapterHelper;
  let adapter: InMemoryAdapterHelper['adapter'];

  beforeAll(async () => {
    testHelper = InMemoryAdapterHelper.init();
    adapter = testHelper.adapter;
    const testFileContent =
`---
createdAt: 2020-12-17
metaDescription: As an experienced Software engineer Wolfgang Rathgeb wants to deliver a  balanced project witch fits user needs. To fulfill, this Wolfgang Rathgeb is also taking a look behind the horizon and do all that is required.
---
### About me

A Computer is a good tool to get ideas easy and cheap to live. But this also increases the number of ideas that are already implemented. Finally, there is mostly something, that isn't implemented or could be done in a better way.

I already started to implement some ideas, but only two had the ability to get something big before they failed because of complications or time problems. Maybe failed is the wrong word, because the project itself failed, but I got a lot of experience and learned to find the gap between theory and practice. Both projects are already some years ago and I was able to increase my knowledge in other projects. Currently, I am working at the HPI-Schul-Cloud project, which gives me the opportunity to learn about processes in companies: How they change and what could go wrong (besides the programming stuff).

I also have some ideas in my mind, but not sure if they are worth to invest time. I am open to good ideas, co-founders, or only a good Open-Source project.
### EOF`;
    await testHelper.createFile(TEST_FILE_PATH, testFileContent);
    await testHelper.createFile('/test/data/test.txt', 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.');
    await testHelper.createFile(TEST_EMPTY_FILE_PATH, '');
  });

  test('constructor', async () => {
    const dir = new Directory(adapter, dirname(TEST_TXT_FILE_PATH));
    const file = new LoomFile(adapter, dir, basename(TEST_TXT_FILE_PATH));
    const reader: Reader = await Editor.from(adapter, file);
    expect(reader).toBeInstanceOf(Editor);
    reader.close();
  });

  test('close', async () => {
    const reader = await createEditor(adapter, TEST_FILE_PATH);
    expect(reader.close()).resolves.toBeUndefined();
  });

  test('from', async () => {
    const dir = new Directory(adapter, dirname(TEST_FILE_PATH));
    const file = new LoomFile(adapter, dir, basename(TEST_FILE_PATH));
    const reader: Reader = await Editor.from(adapter, file);
    expect(reader).toBeInstanceOf(Editor);
    reader.close();
  });

  test('raw', async () => {

    const reader = await createEditor(adapter, TEST_FILE_PATH);
    expect(reader.raw).toBeDefined();
    reader.close();
  });


  describe('search', () => {
    test('find first value', async () => {
      const reader = await createEditor(adapter, TEST_FILE_PATH);
      const result = await reader.searchFirst('sure');
      expect(result).toBeDefined();
      reader.close();
    });

    test('has next value', async () => {
      const reader = await createEditor(adapter, TEST_FILE_PATH);
      const result = await reader.searchFirst('some');
      expect(result).toBeDefined();
      const hasNext = await result?.hasNext();
      expect(hasNext).toBe(true);
      reader.close();
    });

    test('has no next value', async () => {
      const reader = await createEditor(adapter, TEST_FILE_PATH);
      const result = await reader.searchFirst('opportunity');
      expect(result).toBeDefined();
      expect(await result?.hasNext()).toBe(false);
      reader.close();
    });

    test('find next value', async () => {
      const reader = await createEditor(adapter, TEST_FILE_PATH);
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
      const reader = await createEditor(adapter, TEST_FILE_PATH);
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
      const reader = await createEditor(adapter, TEST_FILE_PATH);
      const searchValue = 'surely not';
      const result = await reader.searchFirst(searchValue);
      expect(result).toBeUndefined();
      const result2 = await reader.searchLast(searchValue);
      expect(result2).toBeUndefined();
      reader.close();
    });

    test('has prev value', async () => {
      const reader = await createEditor(adapter, TEST_FILE_PATH);
      const result = await reader.searchLast('it');
      expect(result).toBeDefined();
      const hasPrev = await result?.hasPrev();
      expect(hasPrev).toBe(true);
      reader.close();
    });

    test('has no prev value', async () => {
      const reader = await createEditor(adapter, TEST_FILE_PATH);
      const result = await reader.searchLast('itself');
      expect(result).toBeDefined();
      const hasPrev = await result?.hasPrev();
      expect(hasPrev).toBe(false);
      reader.close();
    });

    test('find last value', async () => {
      const reader = await createEditor(adapter, TEST_FILE_PATH);
      const result = await reader.searchLast('some');
      expect(result).toBeDefined();
      expect(result?.meta.start).toBeGreaterThan(1000);
      reader.close();
    });

    test('find previous value', async () => {
      const reader = await createEditor(adapter, TEST_FILE_PATH);
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
      const reader = await createEditor(adapter, TEST_FILE_PATH);
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
        const editor = await TestEditor.fromPath(adapter, TEST_FILE_PATH);
        const chunk = Buffer.from('This is a test with ab in it.');
        const value = Buffer.from('ab');
        const result = await editor.unwrappedSearchInChunk(value, chunk);
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Array);
        expect(result).toHaveLength(1);
        expect(result[0]).toBe(20);
      });

      test('calcChunkSize', async () => {
        const editor = await TestEditor.fromPath(adapter, TEST_FILE_PATH);
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
        const editor = await TestEditor.fromPath(adapter, TEST_FILE_PATH);
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
        const editor = await TestEditor.fromPath(adapter, TEST_FILE_PATH);
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
        const editor = await TestEditor.fromPath(adapter, TEST_FILE_PATH);
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
        const editor = await TestEditor.fromPath(adapter, TEST_FILE_PATH);
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
      const reader = await createEditor(adapter, TEST_FILE_PATH);
      const result = await reader.firstLine();
      expect(result).toBeDefined();
      const line = await result?.read('utf8');
      expect(line).toBeDefined();
      expect(line).toBeTypeOf('string');
      expect(line).toBe('---');
      reader.close();
    });

    test('read line', async () => {
      const reader = await createEditor(adapter, TEST_FILE_PATH);
      const result = await reader.firstLine();
      expect(result).toBeDefined();
      const line = await result?.read();
      expect(line).toBeDefined();
      expect(line).toBeInstanceOf(Buffer);
      reader.close();
    });

    test('get next line', async () => {
      const reader = await createEditor(adapter, TEST_FILE_PATH);
      const result = await reader.firstLine();
      expect(result).toBeDefined();
      await result.next();
      expect(result).toBeDefined();
      expect(result.read('utf8')).resolves.toBe('createdAt: 2020-12-17');
      reader.close();
    });

    test('read till last lines', async () => {
      const reader = await createEditor(adapter, TEST_FILE_PATH);
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
      const reader = await createEditor(adapter, TEST_FILE_PATH);
      const result = await reader.lastLine();
      expect(result).toBeDefined();
      const line = await result.read();
      expect(line).toBeDefined();
      expect(line).toBeInstanceOf(Buffer);
      reader.close();
    });

    test('read last line as string', async () => {
      const reader = await createEditor(adapter, TEST_FILE_PATH);
      const result = await reader.lastLine();
      expect(result).toBeDefined();
      const line = await result.read('utf8');
      expect(line).toBeDefined();
      expect(line).toBeTypeOf('string');
      expect(line).toBe('### EOF');
      reader.close();
    });

    test('get prev line', async () => {
      const reader = await createEditor(adapter, TEST_FILE_PATH);
      const result = await reader.lastLine();
      expect(result).toBeDefined();
      await result.prev();
      expect(result).toBeDefined();
      expect(result.read('utf8')).resolves.toContain('e some ideas in my mind, but not sure if they');
      reader.close();
    });

    test('read till first lines', async () => {
      const reader = await createEditor(adapter, TEST_FILE_PATH);
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
      const reader = await createEditor(adapter, TEST_EMPTY_FILE_PATH);
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
      const longText = faker.lorem.words(10000);
      testHelper.createFile('/test/data/test_large.txt', longText);
      const fileContentLength = longText.length;
      const reader = await createEditor(adapter, '/test/data/test_large.txt');
      const resultForward = await reader.firstLine();
      expect(resultForward).toBeDefined();
      const line = await resultForward?.read('utf8');
      expect(line.length).toBe(fileContentLength);
      expect(line).toBe(longText);
      const resultBackward = await reader.lastLine();
      expect(resultBackward).toBeDefined();
      const line2 = await resultBackward?.read('utf8');
      expect(line2).toBe(longText);
      expect(line2.length).toBe(fileContentLength);
      reader.close();
    });

  });

  describe('test symbols', () => {

    test('toStringTag', async () => {
      const editor = await createEditor(adapter, TEST_FILE_PATH);
      expect(Object.prototype.toString.call(editor)).toBe('[object LoomEditor]');
      editor.close();
    });
  });
});