import { Reader } from '../editor';
import { SearchItem, TextItemList } from './textItemList';

export interface BaseResult {
	next(): Promise<BaseResult | undefined>;
	prev(): Promise<BaseResult | undefined>;
}
export interface SearchResult extends BaseResult {
	next(): Promise<SearchResult | undefined>;
	prev(): Promise<SearchResult | undefined>;
	searchValue: Buffer;
	readonly meta: SearchItem;
}

export interface LineResult extends BaseResult {
	readLine(): Promise<Buffer>;
}


export class Result implements BaseResult, SearchResult{

	constructor(
		protected _listItem: TextItemList,
		protected _searchValue: Buffer,
		protected reader: Reader
	) {}
	
	get meta(): SearchItem {
		return this._listItem.content as SearchItem;
	}
	
	protected handleSearchResult(result: Result | undefined): Result | undefined {
		if(result !== undefined) {
			result._listItem.add(this._listItem);
		}
		return result;
	}

	protected generateInstance(item: TextItemList): Result {
		return new Result(item, this._searchValue, this.reader);
	}

	async next() {
		const next = this._listItem.next();
		if(next === undefined || next.isReverseRead()) {
			const newResult = await this.reader.search(this._searchValue, this._listItem.end);
			return this.handleSearchResult(newResult as Result | undefined);
		} else {
			return this.generateInstance(next);
		}
	}

	async prev() {
		const prev = this._listItem.prev();
		//TDOD: think about when this is overlapping 
		if(prev === undefined || !prev.isReverseRead()) {
			const newResult = await this.reader.searchLast(this._searchValue, this._listItem.start);
			return this.handleSearchResult(newResult as Result | undefined);
		} else {
			return this.generateInstance(prev);
		}
	}

	get searchValue(): Buffer {
		return this._searchValue;
	}

	async readLine(): Promise<Buffer>
	async readLine(encoding: BufferEncoding): Promise<string>
	async readLine(encoding?: BufferEncoding): Promise<Buffer | string> {
		const end = this._listItem.end;
		const prev = await this.prev();
		const start = prev?._listItem.end ?? 0;


		const line = await this.reader.read(start, end);
		if(encoding !== undefined) {
			return line.toString(encoding);
		} else {
			return line;
		}
	}


	
}
