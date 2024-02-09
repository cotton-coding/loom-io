import { ReaderInternal } from '../editor';
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
	
	protected handleSearchResult(result: SearchResult | undefined): SearchResult | undefined {
		if(result !== undefined) {
			result._listItem.add(this._listItem);
		}
		return result;
	}

	protected generateInstance(item: TextItemList): SearchResult {
		return new SearchResult(item, this._searchValue, this.reader);
	}

	async hasNext(): Promise<boolean> {
		if(this._listItem.hasNext()) {
			return true;
		}

		const fileSize = await this.reader.getSizeInBytes();
		const nextItem = await this.reader.loopForward(this._searchValue, this._listItem.end, fileSize);
		if(nextItem === undefined) {
			return false;
		} else if (nextItem.getLastItem().end === this._listItem.end) {
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
			//return this.generateInstance(this._listItem.next() as TextItemList);
		} else {
			return undefined;
		}
	}

	async hasPrev(): Promise<boolean> {
		if(this._listItem.hasPrev()) {
			return true;
		}
		const prevItem = await this.reader.loopReverse(this._searchValue, 0, this._listItem.start);
		if(prevItem === undefined) {
			return false;
		} else if (prevItem.getFirstItem().start === this._listItem.start ) {
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
			//return this.generateInstance(this._listItem.prev() as TextItemList);
		} else {
			return undefined;
		}
	}

	get searchValue(): Buffer {
		return this._searchValue;
	}

	// async readLine(): Promise<Buffer>
	// async readLine(encoding: BufferEncoding): Promise<string>
	// async readLine(encoding?: BufferEncoding): Promise<Buffer | string> {
	// 	const end = this._listItem.end;
	// 	const prev = await this.prev();
	// 	const start = prev?._listItem.end ?? 0;


	// 	const line = await this.reader.read(start, end);
	// 	if(encoding !== undefined) {
	// 		return line.toString(encoding);
	// 	} else {
	// 		return line;
	// 	}
	// }
	
}

export class LineResult implements BaseResult {

	constructor(
		protected _listItem: TextItemList,
		protected lineEnd: Buffer,
		protected reader: ReaderInternal
	) {}


	async hasNext(): Promise<boolean> {
		if(this._listItem.hasNext()) {
			return true;
		}

		const fileSize = await this.reader.getSizeInBytes();
		const newResult = await this.reader.loopForward(this.lineEnd, this._listItem.end, fileSize);
		if(newResult === undefined) {
			return false;
		} else {
			
			return true;
		}
	}

	async next() {
		const next = this._listItem.next();
		if(next === undefined) {
			const fileSize = await this.reader.getSizeInBytes();
			const newResult = await this.reader.loopForward(this.lineEnd, this._listItem.end, fileSize);
			if(newResult === undefined) {
				return undefined;
			}

		} else {
			return new LineResult(next, this.reader);
		}
	}
}
