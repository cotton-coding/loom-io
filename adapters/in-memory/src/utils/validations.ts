import { MEMORY_TYPE, MemoryDirectory, MemoryFile } from '../definitions.js';

export const isMemoryDirectoryAndMatchName = (item: MemoryFile | MemoryDirectory, name: string): item is MemoryDirectory => item.$type === MEMORY_TYPE.DIRECTORY && item.name === name;
export const isMemoryDirectoryAndMatchNamePrepared = (name: string) => (item: MemoryFile | MemoryDirectory): item is MemoryDirectory => item.$type === MEMORY_TYPE.DIRECTORY && item.name === name;
export const isMemoryFileAndMatchName = (item: MemoryFile | MemoryDirectory, name: string): item is MemoryFile => item.$type === MEMORY_TYPE.FILE && item.name === name;