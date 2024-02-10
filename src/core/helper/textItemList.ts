/* eslint-disable @typescript-eslint/no-this-alias */
export interface TextMeta {
	readonly start: number,
	readonly end: number,
	readonly readReverse?: boolean
	readonly first?: boolean,
	readonly last?: boolean
}

export class TextItemList {

	protected before: TextItemList | undefined;
	protected after: TextItemList | undefined;
	protected _content: TextMeta[];

	constructor(
		content: TextMeta) {
		this._content = [];
		this._content.push(content);
	}

	get content() {
		return this._content[0];
	}

	get original() {
		return this._content[this._content.length-1];
	}

	get start() {
		return this.content.start;
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
			if(f.start < this.start) {
				this.searchAndAddBefore(f);
			} else {
				this.searchAndAddAfter(f);
			}
			f = n!;
		}while(n !== undefined);
		
		return this;
	}

	separate() {
		if(this.before !== undefined) {
			this.before.after = this.after;
			this.before = undefined;
		}
		if(this.after !== undefined) {
			this.after.before = this.before;
			this.after = undefined;
		}
	}


	protected searchAndAddBefore(item: TextItemList): TextItemList {
		if (item.original.start === this.original.start && item.original.end === this.original.end) {
			return this;
		}
		let cur: TextItemList = this;
		let prev: TextItemList | undefined;
		do {
			prev = cur.prev();
			if(prev === undefined) {
				return cur.addBefore(item);
			} else if ( item.original.start > prev.original.start && item.original.start < cur.original.start) { 
				return cur.addBefore(item);
			}
			cur = prev;
		} while (cur.hasPrev());

		return cur.addBefore(item);

	}

	protected searchAndAddAfter(item: TextItemList): TextItemList {

		if (item.original.start === this.original.start && item.original.end === this.original.end) {
			return this;
		}
		let cur: TextItemList = this;
		let next: TextItemList | undefined;
		do {
			next = cur.next();
			if(next === undefined) {
				return cur.addAfter(item);
			} else if ( item.original.start > cur.original.start && item.original.start < next.original.start) { 
				return cur.addAfter(item);
			}
			cur = next;
		} while (cur.hasNext());

		return cur.addAfter(item);
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


	static patch (item: TextItemList, data: TextMeta) {
		item._content.unshift({...item.content, ...data});
	}
}