import { DataInvalidException } from '../exceptions.js';

export interface TextMeta {
	start: number,
	end: number,
	last?: boolean,
	readReverse?: boolean
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

	isFirst() {
		return this.before === undefined;
	}

	isLast() {
		return this.after === undefined;
	}	

	add(item: TextItemList) {
		if(item.start < this.start) {
			return this.searchAndAddBefore(item);
		} else {
			return this.searchAndAddAfter(item);
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



	next(): TextItemList | undefined {
		return this.after;
	}

	prev(): TextItemList | undefined{
		return this.before;
	}
}