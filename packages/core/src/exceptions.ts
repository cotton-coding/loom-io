export function isInstanceOfLoomException(err: unknown, ref: EXCEPTION_REF) {
	return err != null && typeof err === 'object' && !Array.isArray(err) && '__loomExceptionRef' in err && err.__loomExceptionRef === ref;
}

export enum EXCEPTION_REF {
	PLUGIN_NOT_FOUND,
	FILE_CONVERT,
	PATH_NOT_EXISTS,
	NO_SOURCE_ADAPTER,
	DIRECTORY_NOT_EMPTY
}

interface LoomException {
	__loomExceptionRef: EXCEPTION_REF;
}

export class FileConvertException extends Error implements LoomException{
	__loomExceptionRef = EXCEPTION_REF.FILE_CONVERT;
	constructor(path: string, message: string, error?: Error) {
		super(`Error converting file ${path}: ${message}`);
		this.stack = error?.stack;
	}
}

export class PathNotExistsException extends Error implements LoomException{
	__loomExceptionRef = EXCEPTION_REF.PATH_NOT_EXISTS;
	constructor(path: string) {
		super(`Path ${path} does not exist`);
	}
}

export class NoSourceAdapterException extends Error implements LoomException {
	__loomExceptionRef = EXCEPTION_REF.NO_SOURCE_ADAPTER;
	constructor(path: string) {
		super(`No source adapter found for ${path}`);
	}
}

export class DirectoryNotEmptyException extends Error implements LoomException {

	__loomExceptionRef = EXCEPTION_REF.DIRECTORY_NOT_EMPTY;
	_path: string;
	constructor(path: string) {
		super(`Directory ${path} is not empty`);
		this._path = path;
	}
}