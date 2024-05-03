import type { Directory } from './core/dir.js';
import { LoomFile } from './core/file.js';

export enum PLUGIN_TYPE {
    FILE_CONVERTER,
    SOURCE_ADAPTER
}

export enum FILE_SIZE_UNIT {
    BYTE = 'B',
    KILOBYTE = 'KB',
    MEGABYTE = 'MB',
    GIGABYTE = 'GB',
    TERABYTE = 'TB',
    PETABYTE = 'PB',
    EXABYTE = 'EB',
    ZETTABYTE = 'ZB',
    YOTTABYTE = 'YB'
}

export interface LoomPluginBase {
    $type: PLUGIN_TYPE,
    nonce: symbol
}

export interface LoomFileConverter extends LoomPluginBase {
    $type: PLUGIN_TYPE.FILE_CONVERTER,
    verify: (file: LoomFile) => MaybePromise<boolean>
    parse(file: LoomFile): Promise<unknown>
    stringify(file: LoomFile, content: unknown): Promise<void>
}
export interface LoomSourceAdapter extends LoomPluginBase{
    $type: PLUGIN_TYPE.SOURCE_ADAPTER,
    source: (link: string, Type?: typeof Directory | typeof LoomFile) => MaybePromise<Directory | LoomFile> | void,
}

export type LoomPlugin = LoomFileConverter | LoomSourceAdapter;

export type MaybePromise<T> = Promise<T> | T;

export interface ObjectDirentInterface {
    isDirectory(): boolean;
    isFile(): boolean;
    name: string;
    path: string;
}

export type rmdirOptions = {
	recursive?: boolean;
	force?: boolean;
}

export interface FileHandlerReadOptions {
	offset?: number;
	length?: number;
	position?: number;
}

export interface ReadBuffer {
	bytesRead: number;
	buffer: Buffer;
}

export interface FileHandler {
    read(options: FileHandlerReadOptions): MaybePromise<ReadBuffer>
	read(buffer: Buffer): MaybePromise<ReadBuffer>
	read(buffer: Buffer, options: FileHandlerReadOptions): MaybePromise<ReadBuffer>
    close(): MaybePromise<void>
}

export interface SourceAdapter {
    readFile(path: string): MaybePromise<Buffer>
    readFile(path: string, encoding: BufferEncoding): MaybePromise<string>
    readFile(path: string, encoding?: BufferEncoding): MaybePromise<Buffer | string>
    writeFile(path: string, content: string | Buffer): MaybePromise<void>
    deleteFile(path: string): MaybePromise<void>
    openFile(path: string): MaybePromise<FileHandler>
    stat(path: string): MaybePromise<FileStat>
    readdir(path: string): MaybePromise<ObjectDirentInterface[]>
    mkdir(path: string): MaybePromise<void>
    rmdir(path: string, options?: rmdirOptions): MaybePromise<void>
    dirExists(path: string): MaybePromise<boolean>
    fileExists(path: string): MaybePromise<boolean>

}

export interface FileStat {
    size: number,
    mtime: Date,
}