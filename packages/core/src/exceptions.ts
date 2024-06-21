export function isInstanceOfLoomException(err: unknown, ref: EXCEPTION_REF) {
	return (
		err != null &&
		typeof err === "object" &&
		!Array.isArray(err) &&
		"__loomExceptionRef" in err &&
		err.__loomExceptionRef === ref
	);
}

export enum EXCEPTION_REF {
	PLUGIN_NOT_FOUND,
	PATH_NOT_EXISTS,
	NO_SOURCE_ADAPTER,
	DIRECTORY_NOT_EMPTY,
}

interface LoomException {
	__loomExceptionRef: EXCEPTION_REF;
}

export class PathNotFoundException extends Error implements LoomException {
	__loomExceptionRef = EXCEPTION_REF.PATH_NOT_EXISTS;
	constructor(protected _path: string) {
		super(`Path ${_path} does not exist`);
	}

	get path() {
		return this._path;
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
