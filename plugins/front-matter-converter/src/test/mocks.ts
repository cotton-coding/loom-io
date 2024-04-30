import { Editor } from '@loom-io/core';
import { LineResult } from '@loom-io/core/internal';

export class LineResultMock {
	lines: string[];
	index: number;
	constructor(lines: string[] = []) {
		this.lines = lines;
		this.index = 0;
	}

	async next() {
		this.index++;
	}

	async hasNext() {
		return this.index < this.lines.length;
	}

	async read(encoding: string) {
		return this.lines[this.index];
	}
}

export class EditorMock {
	constructor(public lines: string[]) {}

	async firstLine() {
		if(this.lines.length === 0) {
			return undefined;
		}
		return new LineResultMock(this.lines) as unknown as LineResult;
	}
}

export class FileMock {
	lines: string[];
	extension: string;
	constructor(lines: string[] = [''], extension: string = 'md') {
		this.lines = lines;
		this.extension = extension;
	}

	get name() {
		return 'file.' + this.extension;
	}

	reader() {
		return new EditorMock(this.lines) as unknown as Editor;
	}

	write(content: string) {
		this.lines = content.split('\n');
		return Promise.resolve();
	}

}
