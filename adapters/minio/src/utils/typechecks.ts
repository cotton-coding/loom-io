import { MinioException } from '../definitions.js';

export function isMinioException(obj: unknown): obj is MinioException {
	return obj instanceof Error && 'code' in obj;
}