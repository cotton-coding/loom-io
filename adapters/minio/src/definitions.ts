export type mkdirOptions = {
	recursive?: boolean;
}

export interface MinioException {
	code: string;
	bucketName: string;
}