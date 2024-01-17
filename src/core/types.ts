export enum PLUGIN_TYPE {
    FILE_CONVERTER
}

export type LoomFSFileConverter = {
    type: PLUGIN_TYPE.FILE_CONVERTER,
    extensions: string[],
    parse<T = unknown>(content: string): T
    stringify<T = unknown>(content: T): string
}

export type LoomFSPlugin = LoomFSFileConverter;

export type MaybePromise<T> = Promise<T> | T;