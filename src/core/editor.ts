import { File } from './file';
import * as fs from 'fs/promises';
import * as readline from 'node:readline/promises';

export interface Reader {
	readLine(pos: number): Promise<string>;
	close(): Promise<void>;
}

export interface Writer {
	close(): Promise<void>;
}

interface LineInfo {
	end: number,
	length: number
}

export class Editor implements Reader, Writer{

	public readLines: fs.FileHandle['readLines'];
	protected chunkSize: number = 1024;
	protected lineInfo: Array<LineInfo>;
	protected newLineCharacter: number | string = 0x0a;
	protected currentLine: number = 0;
	protected EOF: boolean = false;
	//protected watcher: IterableIterator<fs.FileChangeInfo<string>>;

	constructor(
		protected ref: File,
		protected file: fs.FileHandle
	) {
		this.readLines = file.readLines;
		this.lineInfo = [];
	
		// TODO: watch file for changes
		//fs.watch(ref.path);
	}

	get fileHandle() {
		return this.file;
	}

	async from(file: File): Promise<Editor> {
		const handler = await fs.open(file.path);
		return new Editor(file, handler);
	}

	async close(): Promise<void> {
		await this.file.close();
	}

	protected async addLineInfo(start: number, length: number): void {
		const end = start + length;
		this.lineInfo.push({end, length});
	}



	protected async analyzeNextLine(): Promise<string> {
		const start = this.lineInfo.slice(-1)[0].end;
		

		const stream = this.file.createReadStream({start});
		
		return new Promise((resolve, reject) => {
			let chunk: Buffer | null = null;
			const chunks: Buffer[] = [];
			stream.on('error', reject);
			stream.on('readable', () => {
				while(null !== (chunk = stream.read(this.chunkSize))) {
					const i = chunk.indexOf(this.newLineCharacter);
					if(i !== -1) {
						const str = Buffer.concat(chunks).toString() + chunk.toString().slice(0, i);
						stream.close();
						this.addLineInfo(start, str.length);
						return resolve(str);
					} else {
						chunks.push(chunk);
					}
				}

				const str = Buffer.concat(chunks).toString();
				this.addLineInfo(start, str.length);
				this.EOF = true;

				resolve(str);

			});
		});
	}

	// TODO: think about to give back a buffer instead of a string
	async readLine(pos: number = this.currentLine): Promise<string> {
		let line: string | undefined = undefined;
		while ( !this.EOF && pos >= this.lineInfo.length ) {
			line = await this.analyzeNextLine();
		}

		if(line === undefined) {
			const {end, length} = this.lineInfo[pos];
			line = (await this.file.read({position: end - length, length})).buffer.toString();
		}


		return line;

	}

}