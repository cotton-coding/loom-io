export class FileDoesNotExistException extends Error {
	constructor(path: string) {
		super(`File ${path} does not exist`);
	}
}

export class DirectoryDoesNotExistException extends Error {
	constructor(path: string) {
		super(`Directory ${path} does not exist`);
	}
}

export class PluginNotFoundException extends Error {
	constructor(path: string) {
		super(`No plugin found for ${path}`);
	}
}