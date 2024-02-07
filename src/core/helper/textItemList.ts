/* eslint-disable @typescript-eslint/no-this-alias */
import { DataInvalidException } from '../exceptions.js';

export interface TextMeta {
	start: number,
	end: number,
	readReverse?: boolean
	first?: boolean,
	last?: boolean
}

export interface SearchItem {
	readonly start: number;
	readonly end: number;
	readonly length: number;
}
export class TextItemList {

	protected before: TextItemList | undefined;
	protected after: TextItemList | undefined;

	constructor(
		protected _content: TextMeta) {
	}

	get content() {
		return this._content;
	}

	get start() {
		return this._content.start;
	}

	get end() {
		return this.content.end;
	}

	get length() {
		return this.end - this.start;
	}

	get first() {
		return !!this.content.first;
	}

	get last() {
		return !!this.content.last;
	}

	isReverseRead() {
		return !!this.content.readReverse;
	}

	getLastForward(): TextItemList | undefined{
		if(!this.isReverseRead() && (this.after === undefined || this.after.isReverseRead())) {
			return this;
		} else if(this.isReverseRead() && (this.before === undefined || !this.before.isReverseRead())) {
			return this.before;
		} else if (this.isReverseRead()) {
			return this.before?.getLastForward();
		} else {
			return this.after?.getLastForward();
		}
	}

	getLastReverse(): TextItemList | undefined{
		if(this.isReverseRead() && (this.before === undefined || !this.before.isReverseRead())) {
			return this;
		} else if (!this.isReverseRead() && (this.after === undefined || this.after.isReverseRead())) {
			return this.after;
		} else if (this.isReverseRead()) {
			return this.before?.getLastReverse();
		} else {
			return this.after?.getLastReverse();
		}

	}

	isFirstItem() {
		return this.before === undefined;
	}

	getFirstItem(): TextItemList {
		if(this.before === undefined) {
			return this;
		}
		return this.before.getFirstItem();
	}

	isLastItem() {
		return this.after === undefined;
	}	

	getLastItem(): TextItemList {
		if(this.after === undefined) {
			return this;
		}
		return this.after.getLastItem();
	}

	add(item: TextItemList) {
		let f = item.getFirstItem();
		let n;
		do {
			n = f.next();
			f.separate();
			if(item.start < this.start) {
				this.searchAndAddBefore(item);
			} else {
				this.searchAndAddAfter(item);
			}
			f = n!;
		}while(n !== undefined);
		
		return this;
	}

	separate() {
		if(this.before !== undefined) {
			this.before.after = this.after;
		}
		if(this.after !== undefined) {
			this.after.before = this.before;
		}
	}


	protected searchAndAddBefore(item: TextItemList): TextItemList {
		if( item.start < this.start ) {
			if(this.before == null) {
				return this.addBefore(item);
			}
			return this.before.searchAndAddBefore(item);
		} else if (this.after == null) {
			return this.addAfter(item);
		} else if (item.start < this.after.start) {
			if (item.end > this.end) {
				return this.addAfter(item);
			} else {
				return this.addBefore(item);
			}
		}

		throw new DataInvalidException('Item could not be added');

	}

	protected searchAndAddAfter(item: TextItemList): TextItemList {
		if( item.start > this.start ) {
			if(this.after == null) {
				return this.addAfter(item);
			}
			return this.after.searchAndAddAfter(item);
		} else if (this.before == null) {
			return this.addBefore(item);
		} else if ( item.start > this.before.start) { 
			if (item.end < this.end) {
				return this.addBefore(item);
			} else {
				return this.addAfter(item);
			}
		}
		throw new DataInvalidException('Item could not be added');
	}


	protected addBefore(item: TextItemList): TextItemList {
		
		if(this.before !== undefined) {
			item.before = this.before;
			this.before.after = item;
		}
		item.after = this;
		this.before = item;
		return item;
	}

	protected addAfter(item: TextItemList): TextItemList {
		item.before = this;
		if(this.after !== undefined) {
			this.after.before = item;
			item.after = this.after;
		}
		this.after = item;
		return item;
	}


	hasNext(): boolean {
		return this.after !== undefined;
	}

	next(): TextItemList | undefined {
		return this.after;
	}

	hasPrev(): boolean {
		return this.before !== undefined;
	}

	prev(): TextItemList | undefined{
		return this.before;
	}
}