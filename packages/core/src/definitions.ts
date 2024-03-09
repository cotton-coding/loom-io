import type { Directory } from './core/dir';

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
    type: PLUGIN_TYPE,
    nonce?: string | number
}

export interface LoomFileConverter extends LoomPluginBase {
    type: PLUGIN_TYPE.FILE_CONVERTER,
    extensions: string[],
    parse<T = unknown>(content: string): T
    stringify<T = unknown>(content: T): string
}

export interface LoomSourceAdapter extends LoomPluginBase{
    type: PLUGIN_TYPE.SOURCE_ADAPTER,
    source: (link: string) => Promise<Directory> | void
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

export interface SourceAdapter {
    readFile(path: string): MaybePromise<Buffer>
    readFile(path: string, encoding: BufferEncoding): MaybePromise<string>
    readFile(path: string, encoding?: BufferEncoding): MaybePromise<Buffer | string>
    writeFile(path: string, content: string): MaybePromise<void>
    deleteFile(path: string): MaybePromise<void>
    stat(path: string): MaybePromise<FileStat>
    exists(path: string): MaybePromise<boolean>
    readdir(path: string): MaybePromise<ObjectDirentInterface[]>
    mkdir(path: string): MaybePromise<void>
    rmdir(path: string, options?: rmdirOptions): MaybePromise<void>
}

export interface FileStat {
    size: number,
    mtime: Date,
}