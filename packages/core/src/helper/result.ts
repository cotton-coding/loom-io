import { ReaderInternal } from '../core/editor';
import { TextItemList, TextMeta } from './textItemList';


export interface BaseResult {
	hasNext(): Promise<boolean>;
	next(): Promise<BaseResult | undefined>;
	hasPrev(): Promise<boolean>;
	prev(): Promise<BaseResult | undefined>;
}

export class SearchResult implements BaseResult{


	constructor(
		protected _listItem: TextItemList,
		protected readonly _searchValue: Buffer,
		protected readonly reader: ReaderInternal
	) {}
	
	get meta(): TextMeta {
		return this._listItem.content;
	}

	async hasNext(): Promise<boolean> {
		if(this._listItem.hasNext()) {
			return true;
		}

		const fileSize = await this.reader.getSizeInBytes();
		const nextItem = await this.reader.loopForward(this._searchValue, this._listItem.end, fileSize);
		if(nextItem === undefined || nextItem.getLastItem().end === this._listItem.end) {
			return false;
		} else {
			this._listItem.add(nextItem);
			return true;
		}
	}

	async next() {
		// load next item if not already analyzed
		if(await this.hasNext()) {
			this._listItem = this._listItem.next() as TextItemList;
			return this;
		} else {
			return undefined;
		}
	}

	async hasPrev(): Promise<boolean> {
		if(this._listItem.hasPrev()) {
			return true;
		}
		const prevItem = await this.reader.loopReverse(this._searchValue, 0, this._listItem.start);
		if(prevItem === undefined || prevItem.getFirstItem().end === this._listItem.start) {
			return false;
		} else {
			this._listItem.add(prevItem);
			return true;
		}
	}

	async prev() {
		// load previous item if not already analyzed
		if(await this.hasPrev()) {
			this._listItem = this._listItem.prev() as TextItemList;
			return this;
		} else {
			return undefined;
		}
	}

	get searchValue(): Buffer {
		return this._searchValue;
	}
}

export class LineResult implements BaseResult {

	constructor(
		protected _listItem: TextItemList,
		protected lineEnd: Buffer,
		protected reader: ReaderInternal
	) {
		this.patchPrevItems();
		this.patchNextItems();
	}

	protected patchPrevItems() {
		let cur = this._listItem;
		while(cur.hasPrev()) {
			const prev = cur.prev()!;
				
			TextItemList.patch(prev, {
				...prev.content,
				start: prev.end,
				end: cur.start
			});
			cur = prev;
		}
	}

	protected patchNextItems() {
		let cur = this._listItem;
		while(cur.hasNext()) {
			const next = cur.next()!;
			TextItemList.patch(next, {
				...next.content,
				start: cur.end
			});
			cur = next;
		}
	}

	async hasNext(): Promise<boolean> {
		if(this._listItem.hasNext()) {
			return true;
		}

		const fileEnd = await this.reader.getSizeInBytes();
		if(this._listItem.end >= fileEnd) {
			return false;
		}

		const fileSize = await this.reader.getSizeInBytes();
		const newResult = await this.reader.loopForward(this.lineEnd, this._listItem.end, fileSize);
		
		
		if(newResult === undefined || newResult.getLastItem().end === this._listItem.end) {
			const listItem = new TextItemList({
				start: this._listItem.end, 
				end: fileEnd + this.lineEnd.length
			});
			this._listItem.add(listItem);
			return true;
		} else {
			this._listItem.add(newResult);
			this.patchNextItems();
			return true;
		}
	}

	async next() {
		if(await this.hasNext()) {
			this._listItem = this._listItem.next()!;
			return this;
		} else {
			return undefined;
		}
	}

	async hasPrev(): Promise<boolean> {
		if(this._listItem.hasPrev()) {
			return true;
		}

		if(this._listItem.start === 0) {
			return false;
		}

		const newResult = await this.reader.loopReverse(this.lineEnd, 0, this._listItem.start);
		if(newResult === undefined || newResult.getFirstItem().end === this._listItem.start) {
			const listItem = new TextItemList({
				start: 0, 
				end: this._listItem.start
			});
			this._listItem.add(listItem);
			return true;
		} else {
			this._listItem.add(newResult);
			this.patchPrevItems();
			return true;
		}
	}

	async prev() {
		if(await this.hasPrev()) {
			this._listItem = this._listItem.prev()!;
			return this;
		} else {
			return undefined;
		}
	}

	async read(encoding: BufferEncoding): Promise<string>
	async read(): Promise<Buffer>
	async read(encoding?: BufferEncoding): Promise<Buffer | string> {
		const start = this._listItem.start;
		const length = this._listItem.length - this.lineEnd.length;
		const line = length === 0 ? Buffer.from('') : await this.reader.read(start, length);
		if(encoding == null) {
			return line;
		} else {
			return line.toString(encoding);
		}
	}

}
