export enum MEMORY_TYPE {
	ROOT,
	DIRECTORY,
	FILE,
}

export type MemoryObject = MemoryFile | MemoryDirectory;

export interface MemoryFile {
	$type: MEMORY_TYPE.FILE;
	name: string;
	ext: string | undefined;
	content: Buffer;
	mtime: Date;
	birthtime: Date;
}

export type MemoryRoot = {
	$type: MEMORY_TYPE.ROOT;
	content: Array<MemoryFile | MemoryDirectory>;
}


export type MemoryDirectory = {
	$type: MEMORY_TYPE.DIRECTORY;
	name: string;
	content: Array<MemoryFile | MemoryDirectory>;
}

export const isMemoryDirectory = (item: MemoryFile | MemoryDirectory): item is MemoryDirectory => item.$type === MEMORY_TYPE.DIRECTORY;
export const isMemoryFile = (item: MemoryFile | MemoryDirectory): item is MemoryFile => item.$type === MEMORY_TYPE.FILE;