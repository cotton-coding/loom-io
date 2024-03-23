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

export class PluginNotFoundException extends Error implements LoomException{
	__loomExceptionRef = EXCEPTION_REF.PLUGIN_NOT_FOUND;
	constructor(path: string) {
		super(`No plugin found for ${path}`);
	}

}

export class FileConvertException extends Error implements LoomException{
	__loomExceptionRef = EXCEPTION_REF.FILE_CONVERT;
	constructor(path: string, message: string) {
		super(`Error converting file ${path}: ${message}`);
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
	protected _path: string;
	constructor(path: string) {
		super(`Directory ${path} is not empty`);
		this._path = path;
	}
}