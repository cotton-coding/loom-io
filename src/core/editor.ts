import { LoomFile } from './file';
import * as fs from 'fs/promises';
import { BaseResult, LineResult, Result, SearchResult } from './helper/result';
import { TextItemList } from './helper/textItemList';

export interface Reader {
	search(value: string | Buffer): Promise<Result | undefined>;
	search(value: string | Buffer, start: number): Promise<Result | undefined>;
	searchLast(value: string | Buffer): Promise<Result | undefined>;
	searchLast(value: string | Buffer, start: number): Promise<Result | undefined>;
	read(start: number, length: number): Promise<Buffer>;
	close(): Promise<void>;
}

export interface Writer {
	close(): Promise<void>;
}

export class Editor implements Reader, Writer{

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

	get raw() {
		return this.file;
	}

	async close(): Promise<void> {
		await this.file.close();
	}

	protected addLineInfo(start: number, length: number): void {
		const end = start + length;
		const newItem = new TextItemList({start, end});
		if(this.lineInfo === undefined) {
			this.lineInfo = newItem;
		} else {
			this.lineInfo.add(newItem);
		}
	}

	/**
	 * Search for a string in the file by chunking the file into pieces to avoid memory overflow.
	 * set start to 'EOF' to search from the end of the file.
	 * 
	 * @param value - value to search
	 * @param start - start position in the file
	 */
	async search<T extends BaseResult = SearchResult>(value: string | Buffer, start: number = 0): Promise<T | undefined> {
		const searchValue = Buffer.from(value);
		const item =  await this.loopForward(searchValue, start);
		if(item === undefined) {
			return undefined;
		}
		return (new Result(item, searchValue, this)) as unknown as T;
	}

	/**
	 * Search for a string in the file by chunking the file into pieces to avoid memory overflow.
	 * set start to 'EOF' to search from the end of the file.
	 * 
	 * @param value - value to search
	 * @param start - last value included in the search
	 */
	async searchLast<T extends BaseResult = SearchResult>(value: string | Buffer, start: number | 'EOF' = 'EOF'): Promise<T | undefined> {
		const searchValue = Buffer.from(value);
		const item = await this.loopReverse(searchValue, 0, start);
		if(item === undefined) {
			return undefined;
		}
		return new Result(item, searchValue, this) as unknown as T;
	}

	protected calcChunkSize(valueLength: number): number {
		return this.chunkSize > valueLength ? this.chunkSize : valueLength*3;
	}

	protected async loopForward(value: Buffer, start: number = 0, end: number | 'EOF' = 'EOF'): Promise<TextItemList | undefined> {
		let position = start;
		const last = await this.convertEOF(end);

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

	protected async loopReverse(value: Buffer, first: number = 0, last: number | 'EOF' = 'EOF'): Promise<TextItemList | undefined> {
		let position = await this.convertEOF(last);
		if(first > position) {
			return undefined;
		}
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

	protected async convertEOF(value: number | 'EOF'): Promise<number> {
		if(value === 'EOF') {
			const stat = await this.file.stat();
			return stat.size;
		} else {
			return value;
		}
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
		let nextPosition = current - (chunkSize + valueLength/2);
		let length: number = chunkSize + valueLength;
		
		if(nextPosition < min) {
			nextPosition = min;
			length = current - min + valueLength/2;
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

	async read(start: number, length: number): Promise<Buffer> {
		const data = await this.file.read({position: start, length});
		return data.buffer;
	}

	async readAsString(start: number, length: number): Promise<string>
	async readAsString(start: number, length: number, encoding: BufferEncoding): Promise<string>
	async readAsString(start: number, length: number, encoding: BufferEncoding = 'utf8'): Promise<string> {
		const buffer = await this.read(start, length);
		return buffer.toString(encoding);
	}
	
	async getFirstLine(separator: Buffer | string = '\n'): Promise<LineResult | undefined>{
		const bSeparator = Buffer.from(separator);
		const item = await this.loopForward(bSeparator);
		if(item === undefined) {
			return undefined;
		}

		return new Result(item, bSeparator, this);
	}

	async getLastLine(separator: Buffer | string = '\n'): Promise<LineResult | undefined>{
		const bSeparator = Buffer.from(separator);
		const item = await this.loopReverse(bSeparator);
		if(item === undefined) {
			return undefined;
		}

		return new Result(item, bSeparator, this);
	}



	// protected async analyzeNextLine(): Promise<string> {
	// 	const start = this.lineInfo.slice(-1)[0].end;
		

	// 	const stream = this.file.createReadStream({start});
		
	// 	return new Promise((resolve, reject) => {
	// 		let chunk: Buffer | null = null;
	// 		const chunks: Buffer[] = [];
	// 		stream.on('error', reject);
	// 		stream.on('readable', () => {
	// 			while(null !== (chunk = stream.read(this.chunkSize))) {
	// 				const i = chunk.indexOf(this.newLineCharacter);
	// 				if(i !== -1) {
	// 					const str = Buffer.concat(chunks).toString() + chunk.toString().slice(0, i);
	// 					stream.close();
	// 					this.addLineInfo(start, str.length);
	// 					return resolve(str);
	// 				} else {
	// 					chunks.push(chunk);
	// 				}
	// 			}

	// 			const str = Buffer.concat(chunks).toString();
	// 			this.addLineInfo(start, str.length);
	// 			this.EOF = true;

	// 			resolve(str);

	// 		});
	// 	});
	// }

	// protected async analyzePreviousLine(): Promise<string> {
	// 	const eof = await this.convertEOF('EOF');
	// 	const item = 
	// 	this.search(this.newLineCharacter, 'EOF');
	// }

	// // TODO: think about to give back a buffer instead of a string
	// async readLine(lineNumber: number = this.currentLine): Promise<string> {
	// 	let line: string | undefined = undefined;
	// 	while ( !this.EOF && lineNumber >= this.lineInfo.length ) {
	// 		line = await this.analyzeNextLine();
	// 	}

	// 	if(line === undefined) {
	// 		const {end, length} = this.lineInfo[lineNumber];
	// 		line = (await this.file.read({position: end - length, length})).buffer.toString();
	// 	}


	// 	return line;

	// }


}