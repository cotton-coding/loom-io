import { Directory } from "../core/dir.js";
import { LoomFile } from "../core/file.js";
import { Editor, Reader } from "../core/editor.js";
import { List } from "../core/list.js";
import { PLUGIN_TYPE, FILE_SIZE_UNIT } from "../definitions.js";

export { PLUGIN_TYPE, FILE_SIZE_UNIT };
export * from "../exceptions.js";
export * from "../definitions.js";
export type { LoomFile, LoomFile as File, Directory, Editor, Reader, List };

export function isDirectory(obj: unknown): obj is Directory {
	return obj instanceof Directory;
}

export function isFile(obj: unknown): obj is LoomFile {
	return obj instanceof LoomFile;
}

export function isEditor(obj: unknown): obj is Editor {
	return obj instanceof Editor;
}

export function isReader(obj: unknown): obj is Reader {
	return obj instanceof Editor;
}

export function isList(obj: unknown): obj is List {
	return obj instanceof List;
}
