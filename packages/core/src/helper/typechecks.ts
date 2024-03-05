export function isErrnoException(obj: unknown): obj is NodeJS.ErrnoException {
	return obj instanceof Error && 'code' in obj && 'errno' in obj;
}