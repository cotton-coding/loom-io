export type LoomFSFileConverter = {
    type: 'jsonConverter',
    extentions: string[],
    parse<T = unknown>(content: string): T
    stringify<T = unknown>(content: T): string
}

export type LoomFSPlugin = LoomFSFileConverter;

export type MaybePromise<T> = Promise<T> | T;