export class PluginNotFoundException extends Error {
	constructor(path: string) {
		super(`No plugin found for ${path}`);
	}
}

export class FileConvertException extends Error {
	constructor(path: string, message: string) {
		super(`Error converting file ${path}: ${message}`);
	}
}