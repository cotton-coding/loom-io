import { PathLike } from "node:fs";
import { type LoomSourceAdapter } from "@loom-io/core";
import { Adapter } from "../core/adapter.js";
import { dirname, basename } from "node:path";
import { Directory, LoomFile } from "@loom-io/core/internal";

import { resolve } from "node:path";

export class FilesystemAdapter implements LoomSourceAdapter {
	protected adapter: Adapter;
	protected rootdir: PathLike;
	constructor(rootdir: PathLike = process.cwd()) {
		this.rootdir = rootdir;
		this.adapter = new Adapter(rootdir);
	}
	file(path: string): LoomFile {
		const dir = new Directory(this.adapter, dirname(path));
		return new LoomFile(this.adapter, dir, basename(path));
	}
	dir(path: string): Directory {
		return new Directory(this.adapter, path);
	}

	getFullPath(dirOrFile: Directory | LoomFile, ignoreAdapter = false) {
		if (!ignoreAdapter && this.adapter !== dirOrFile.adapter) {
			throw new Error("The directory or file does not belong to this adapter");
		}
		return resolve(this.rootdir.toString(), dirOrFile.path);
	}
}
