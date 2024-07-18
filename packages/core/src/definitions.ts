import type { Directory } from "./core/dir.js";
import { LoomFile } from "./core/file.js";

export enum PLUGIN_TYPE {
	FILE_CONVERTER,
}

export enum FILE_SIZE_UNIT {
	BYTE = "B",
	KILOBYTE = "KB",
	MEGABYTE = "MB",
	GIGABYTE = "GB",
	TERABYTE = "TB",
	PETABYTE = "PB",
	EXABYTE = "EB",
	ZETTABYTE = "ZB",
	YOTTABYTE = "YB",
}

export interface LoomSourceAdapter {
	file: (path: string) => MaybePromise<LoomFile>;
	dir: (path: string) => MaybePromise<Directory>;
}

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
};

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
	read(options: FileHandlerReadOptions): MaybePromise<ReadBuffer>;
	read(buffer: Buffer): MaybePromise<ReadBuffer>;
	read(
		buffer: Buffer,
		options: FileHandlerReadOptions
	): MaybePromise<ReadBuffer>;
	close(): MaybePromise<void>;
}

export interface SourceAdapter<TStat extends FileStat = FileStat> {
	readFile(path: string): MaybePromise<Buffer>;
	readFile(path: string, encoding: BufferEncoding): MaybePromise<string>;
	readFile(
		path: string,
		encoding?: BufferEncoding
	): MaybePromise<Buffer | string>;
	writeFile(path: string, content: string | Buffer): MaybePromise<void>;
	deleteFile(path: string): MaybePromise<void>;
	openFile(path: string): MaybePromise<FileHandler>;
	stat(path: string): MaybePromise<TStat>;
	readdir(path: string): MaybePromise<ObjectDirentInterface[]>;
	mkdir(path: string): MaybePromise<void>;
	rmdir(path: string, options?: rmdirOptions): MaybePromise<void>;
	dirExists(path: string): MaybePromise<boolean>;
	fileExists(path: string): MaybePromise<boolean>;
	isCopyable(adapter: SourceAdapter): MaybePromise<boolean>;
	copyFile(from: string, to: string): MaybePromise<void>;
}

export interface FileStat {
	size: number;
	mtime: Date;
	atime?: Date;
	ctime?: Date;
	birthtime?: Date;

}
