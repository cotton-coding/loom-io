export function isNodeErrnoExpression(error: unknown): error is NodeJS.ErrnoException {
	return error instanceof Error && 'code' in error && 'errno' in error;
}