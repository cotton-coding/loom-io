import type { BucketItem } from 'minio';

export class ObjectDirent {

	constructor(
		protected _bucketItem: BucketItem
	) {}

	isDirectory() {
		const { size, name, prefix } = this._bucketItem;
		if(prefix?.endsWith('/') || name?.endsWith('/')) {
			return true;
		}
		return false;
	}

	isFile() {
		return !this.isDirectory();
	}

	private getPathAndName() {
		const { name, prefix } = this._bucketItem;
		const path = prefix || name;
		if(!path) {
			throw new Error('No path or name found');
		}
		const split = path.split('/');
		if(this.isDirectory()) {
			split.pop();
		}
		const currentObjectName = split.pop();
		return [split.join('/'), currentObjectName];
	}

	get name() {
		const [, name] = this.getPathAndName();
		return name;
	}

	get path() {
		const [path] = this.getPathAndName();
		return path;
	}

}