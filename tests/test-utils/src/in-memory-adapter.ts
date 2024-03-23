import { Adapter as InMemory } from '@loom-io/in-memory-adapter/internal';
import { splitTailingPath } from '@loom-io/common';
import { faker } from '@faker-js/faker';
import { join as joinPath } from 'node:path';

export class InMemoryAdapterHelper {

	protected _last: string | undefined;

	protected constructor(
		protected _adapter: InMemory
	) {}

	get adapter() {
		return this._adapter;
	}

	createMultipleDirectories(amount: number = faker.number.int({min: 1, max: 20}), base: string = '') {
		const paths: string[] = [];
		for(let i = 0; i < amount; i++) {
			paths.push(this.createDirectory(undefined, base));
		}

		return paths;
	}

	createDirectory(path: string = faker.system.directoryPath(), base: string = '') {
		path = joinPath(base, path);
		this._adapter.mkdir(path);
		this._last = path;
		return path;
	}

	createFile(path: string = faker.system.commonFileName(), content: string = faker.lorem.paragraphs(3)) {
		const [dirPath, ] = splitTailingPath(path);
		if(dirPath) {
			this._adapter.mkdir(dirPath);
		}
		this._adapter.writeFile(path, content);
		this._last = path;
		return path;
	}

	get last() {
		return this._last;
	}

	static init() {
		const adapter = new InMemory();
		return new InMemoryAdapterHelper(adapter);
	}

	destroy() {
	}
}