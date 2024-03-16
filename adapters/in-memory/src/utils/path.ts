


export function removePresentedSlash(path: string): string {
	if (path.startsWith('/')) {
		return path.slice(1);
	}
	return path;
}

export function removeTailingSlash(path: string): string {
	if (path.endsWith('/')) {
		return path.slice(0, -1);
	}
	return path;
}
export function removePresentedAndTrailingSlash(path: string): string {
	return removeTailingSlash(removePresentedSlash(path));
}

export function splitTailingPath(path: string): [string | undefined, string] {
	const index = removeTailingSlash(path).lastIndexOf('/');
	if (index === -1) {
		return [undefined, path];
	}
	return [path.slice(0, index), path.slice(index + 1)];
}