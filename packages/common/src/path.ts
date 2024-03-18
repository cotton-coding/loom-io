


export function removePrecedingSlash(path: string): string {
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
export function removePrecedingAndTrailingSlash(path: string): string {
	return removeTailingSlash(removePrecedingSlash(path.trim()));
}

export function splitTailingPath(path: string): [string, string] | [string, undefined] | [string, string]{
	if(path === '' || path === '/') {
		return ['/', undefined];
	}
	const index = removeTailingSlash(path).lastIndexOf('/');
	if (index === -1) {
		return ['/', path];
	}
	return [path.slice(0, index + 1), path.slice(index + 1)];
}