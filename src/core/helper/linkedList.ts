
export class ListItem<T> {

	protected before: ListItem<T> | undefined;
	protected after: ListItem<T> | undefined;

	constructor(
		public content: T,
	) {}

	getFirst() {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let cur: ListItem<T> = this;
		while(cur.prev() !== undefined) {
			cur = cur.prev()!;
		}

		return cur;
	}

	getLast() {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let cur: ListItem<T> = this;
		while(cur.next() !== undefined) {
			cur = cur.next()!;
		}

		return cur;
	}


	addBefore(item: ListItem<T>) {
		item.before = this.before;
		item.after = this;
		this.before = item;
		return item;
	}

	addAfter(item: ListItem<T>) {
		item.before = this;
		item.after = this.after;
		this.after = item;
		return item;
	}

	remove() {
		this.before?.addAfter(this.after!);
	}

	prev() {
		return this.before;
	}

	next() {
		return this.after;
	}

}