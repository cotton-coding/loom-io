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

export interface SourceAdapter {
    read(path: string): MaybePromise<Buffer>
    write(path: string, content: string): MaybePromise<void>
    exists(path: string): MaybePromise<boolean>
    delete(path: string): MaybePromise<void>
    list(path: string): MaybePromise<string[]>
    mkdir(path: string): MaybePromise<void>
    rmdir(path: string): MaybePromise<void>
    size(path: string): MaybePromise<number>

}