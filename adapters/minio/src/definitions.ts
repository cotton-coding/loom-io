export type mkdirOptions = {
	recursive?: boolean;
}

export type rmdirOptions = {
	recursive?: boolean;
	force?: boolean;
}

export interface MinioException {
	code: string;
	bucketName: string;
}