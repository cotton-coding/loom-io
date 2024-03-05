import { LoomFile } from './file';
import * as fs from 'fs/promises';
import { LineResult, SearchResult } from '../helper/result';
import { TextItemList } from '../helper/textItemList';

interface ReadWrite {
	getSizeInBytes(): Promise<number>;
}

export interface Reader extends ReadWrite {
	search(value: string | Buffer): Promise<SearchResult | undefined>;
	searchFirst(value: string | Buffer): Promise<SearchResult | undefined>;
	searchFirst(value: string | Buffer, start: number): Promise<SearchResult | undefined>;
	searchLast(value: string | Buffer): Promise<SearchResult | undefined>;
	searchLast(value: string | Buffer, start: number): Promise<SearchResult | undefined>;
	read(start: number, length: number): Promise<Buffer>;
	close(): Promise<void>;
}

export interface ReaderInternal extends Reader {
	loopForward(value: Buffer, first: number, last: number): Promise<TextItemList | undefined>;
	loopReverse(value: Buffer, first: number, last: number): Promise<TextItemList | undefined>;
}

export interface Writer {
	close(): Promise<void>;
}

export class Editor implements Reader, Writer, ReaderInternal{

	protected chunkSize: number = 1024;
	protected lineInfo: TextItemList | undefined;
	protected newLineCharacter: Buffer = Buffer.from('\n'); //0x0a = \n
	protected currentLine: number = 0;
	protected EOF: boolean = false;
	//protected watcher: IterableIterator<fs.FileChangeInfo<string>>;

	static async from(file: LoomFile): Promise<Editor> {
		const handler = await fs.open(file.path);
		return new Editor(file, handler);
	}

	constructor(
		protected ref: LoomFile,
		protected file: fs.FileHandle
	) {

		// TODO: watch file for changes
		//fs.watch(ref.path);
	}

	/**
	 * Get the raw file handle
	 */
	get raw() {
		return this.file;
	}

	async getSizeInBytes(): Promise<number> {
		return await this.ref.getSizeInBytes();
	}

	/**
	 * Close the file
	 */
	async close(): Promise<void> {
		await this.file.close();
	}

	/**
	 * Alias for searchFirst
	 * 
	 * @param value - value to search
	 * @returns 
	 */
	async search(value: string | Buffer): Promise<SearchResult | undefined> {
		return await this.searchFirst(value);
	}

	/**
	 * Search for a string in the file by chunking the file into pieces to avoid memory overflow.
	 * set start to 'EOF' to search from the end of the file.
	 * 
	 * @param value - value to search
	 * @param start - start position in the file
	 */
	async searchFirst(value: string | Buffer, start: number = 0): Promise<SearchResult | undefined> {
		const searchValue = Buffer.from(value);
		const fileSize = await this.getSizeInBytes();
		const item =  await this.loopForward(searchValue, start, fileSize);
		if(item === undefined) {
			return undefined;
		}
		return new SearchResult(item, searchValue, this);
	}

	/**
	 * Search for a string in the file by chunking the file into pieces to avoid memory overflow.
	 * set start to 'EOF' to search from the end of the file.
	 * 
	 * @param value - value to search
	 * @param start - last value included in the search
	 */
	async searchLast(value: string | Buffer, start?: number): Promise<SearchResult | undefined> {
		const searchValue = Buffer.from(value);
		const item = await this.loopReverse(searchValue, 0, start || await this.getSizeInBytes());
		if(item === undefined) {
			return undefined;
		}
		return new SearchResult(item, searchValue, this);
	}

	protected calcChunkSize(valueLength: number): number {
		return this.chunkSize > valueLength ? this.chunkSize : valueLength*3;
	}

	async loopForward(value: Buffer, first: number, last: number): Promise<TextItemList | undefined> {
		let position = first;

		const valueLength = value.length;
		const chunkSize = this.calcChunkSize(valueLength);
		let item: TextItemList | undefined = undefined;
		const length = chunkSize + valueLength;
		do {
			const chunk = await this.read(position, length);
			const matches = this.searchInChunk(value, chunk);
			item = this.convertChunkMatchesToItems(matches, valueLength, position);
			position += (chunkSize - valueLength/2);
		} while (item === undefined && position < last);

		return item?.getFirstItem();
	}

	async loopReverse(value: Buffer, first: number = 0, last: number): Promise<TextItemList | undefined> {
		let position = last;
		const valueLength = value.length;
		const chunkSize = this.calcChunkSize(valueLength);
		let item: TextItemList | undefined;
		do {
			const param = this.loopReverseCalcNextChunk(position, chunkSize, valueLength, first);
			({position} = param);
			const chunk = (await this.file.read(param)).buffer;
			const matches = this.searchInChunk(value, chunk);
			
			item = this.convertChunkMatchesToItems(matches, valueLength, position, true);
			
		} while (item === undefined && position > first);

		return item?.getLastItem();
	}	

	protected searchInChunk(value: Buffer, chunk: Buffer): number[] {
		const results: number[] = [];
		let i = 0;
		while((i = chunk.indexOf(value, i)) !== -1) {
			results.push(i);
			i += value.length;
		}
		return results;
	}


	/**
	 * Generate the next chunk position and length for fs.read function
	 * 
	 * @param current - Start position of the last chunk
	 * @param chunkSize - chunk size of the last chunk
	 * @param valueLength - length of the value to search
	 * @param min - minimum positive position in file
	 * @returns 
	 */
	protected loopReverseCalcNextChunk(current: number, chunkSize: number, valueLength: number, min: number): {position: number, length: number} {
		let nextPosition = current - (chunkSize + Math.floor(valueLength/2));
		let length: number = chunkSize + valueLength;
		
		if(nextPosition < min) {
			nextPosition = min;
			length = current - min + Math.floor(valueLength/2);
		} 
		

		return {position: nextPosition, length};
	}
	

	protected convertChunkMatchesToItems(matches: number[], valueLength: number, chunkPosition: number, isReverseRead: boolean = false): TextItemList | undefined{
		return matches.reduce<TextItemList | undefined>((item, match) => {
			const start = chunkPosition + match;
			const end = start + valueLength;
			const newItem = new TextItemList({start, end, readReverse: isReverseRead});
			item?.add(newItem);	
			return item ?? newItem;
		}, undefined);
	}

	/**
	 * Read a chunk of the file
	 * 
	 * @param start - start position in the file
	 * @param length - length of the data to read
	 * @returns - return a buffer with the data read from the file
	 */
	async read(start: number, length: number): Promise<Buffer> {
		const buffer = Buffer.alloc(length);
		const data = await this.file.read({position: start, buffer});
		return data.buffer;
	}

	protected async handleFileWithOnlyOneLine(separator: Buffer): Promise<LineResult> {
		const fileSize = await this.getSizeInBytes();
		const item = new TextItemList({start: 0, end: fileSize + separator.length});
		return new LineResult(item.getFirstItem(), separator, this);
	}
	
	/**
	 * Analyze the file junkvisely till the first line is found 
	 * and return a LineResult object to read the line or step to the next one. 
	 *  
	 * @param separator - line separator to use, default is new line character LF 
	 * @returns - return a LineResult object witch allow you to read line by line forward (next) and backward (prev)  
	 */
	async firstLine(separator: Buffer | string = this.newLineCharacter): Promise<LineResult>{
		const bSeparator = Buffer.from(separator);
		const fileSize = await this.getSizeInBytes();
		const item = await this.loopForward(bSeparator, 0, fileSize);
		
		if(item === undefined) {
			return await this.handleFileWithOnlyOneLine(bSeparator);
		}

		const first = item.getFirstItem();

		TextItemList.patch(first, {
			...first.content,
			start: 0
		});

		return new LineResult(first, bSeparator, this);
	}

	/**
	 * Analyze the file junkvisely from the end till the last line is found
	 * and return a LineResult object to read the line or step to the previous one.
	 * 
	 * @param separator - line separator to use, default is new line character LF
	 * @returns - return a LineResult object witch allow you to read line by line forward (next) and backward (prev)
	 */
	async lastLine(separator: Buffer | string = this.newLineCharacter): Promise<LineResult>{
		const bSeparator = Buffer.from(separator);
		const fileSize = await this.getSizeInBytes();
		const item = await this.loopReverse(bSeparator, 0, fileSize);
		if(item === undefined) {
			return await this.handleFileWithOnlyOneLine(bSeparator);
		}

		const last = item.getLastItem();

		TextItemList.patch(last, {
			...last.content,
			start: last.content.end,
			end: fileSize + bSeparator.length
		});

		return new LineResult(last, bSeparator, this);
	}

}