import { LoomFile } from './file';
import * as fs from 'fs/promises';
import { Result } from './helper/result';
import { TextItemList } from './helper/textItemList';

export interface Reader {
	search(value: string, start?: number): Promise<Result | undefined>;
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
	 * @param value 
	 * @param start 
	 */
	async search(value: string): Promise<Result | undefined>;
	async search(value: string, start: number = 0): Promise<Result | undefined> {
		return await this.loopForward(value, start);
	}

	async searchReverse(value: string, start: number | 'EOF' = 'EOF'): Promise<Result | undefined> {
		return this.loopReverse(value, 0, start);
	}

	protected calcChunkSize(valueLength: number): number {
		return this.chunkSize > valueLength ? this.chunkSize : valueLength*3;
	}

	protected async loopForward(search: string | Buffer, start: number = 0, end: number | 'EOF' = 'EOF'): Promise<Result | undefined> {
		let position = start;
		const last = await this.convertEOF(end);
		const value = Buffer.from(search);

		const valueLength = value.length;
		const chunkSize = this.calcChunkSize(valueLength);
		let item: TextItemList | undefined = undefined;
		const length = chunkSize + valueLength;
		do {
			const chunk = (await this.file.read({position, length})).buffer;
			console.log(chunk.toString());
			const matches = this.searchInChunk(value, chunk);
			item = this.convertChunkMatchesToItems(matches, valueLength, position);
			position += (chunkSize - valueLength/2);
		} while (item === undefined && position < last);

		if(item === undefined) {
			return undefined;
		}

		return new Result(item, this);
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
		const result: number[] = [];
		let i = 0;
		while((i = chunk.indexOf(value, i)) !== -1) {
			result.push(i);
			i += value.length;
		}
		return result;
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
	

	protected convertChunkMatchesToItems(matches: number[], valueLength: number, chunkPosition: number): TextItemList | undefined{
		return matches.reduce<TextItemList | undefined>((item, match) => {
			const start = chunkPosition + match;
			const end = start + valueLength;
			const newItem = new TextItemList({start, end});
			item?.add(newItem);	
			return item ?? newItem;
		}, undefined);
	}


	protected async loopReverse(search: string | Buffer, start: number = 0, end: number | 'EOF' = 'EOF'): Promise<Result | undefined> {
		let position = await this.convertEOF(end);
		if(start > position) {
			return undefined;
		}
		const value = Buffer.from(search);
		const valueLength = value.length;
		const chunkSize = this.calcChunkSize(valueLength);
		
		let item: TextItemList | undefined;
		do {
			const param = this.loopReverseCalcNextChunk(position, chunkSize, valueLength, start);
			({position} = param);
			const chunk = (await this.file.read(param)).buffer;
			const matches = this.searchInChunk(value, chunk);
			
			item = this.convertChunkMatchesToItems(matches, valueLength, position - chunkSize);
			
		} while (item === undefined && position > start);

		if(item === undefined) {
			return undefined;
		}

		return new Result(item, this);
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