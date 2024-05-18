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

export function addPrecedingSlash(path: string): string {
	if (!path.startsWith('/')) {
		return `/${path}`;
	}
	return path;
}

export function addTailingSlash(path: string): string {
	if (!path.endsWith('/')) {
		return `${path}/`;
	}
	return path;
}

export function addPrecedingAndTailingSlash(path: string): string {
	return addTailingSlash(addPrecedingSlash(path.trim()));
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

export function getPathDepth(path: string): number {
	const elements = removePrecedingAndTrailingSlash(path).split('/');
	if (elements.length === 1 && elements[0] === '') {
		return 0;
	}
	return elements.length;
}


/**
 * Take relative and fix paths. The function will ignore preceding, trailing slashes and relative slashes on the same level (./).
 * If the return is a subpath it will be returned with a trailing slash.
 * If depth is higher than the path depth, the function will return the path as it is given.
 * @param path
 * @param depth
 * @returns
 */
export function getSegmentsOfPath(path: string, depth: number): string {
	const isRelative = path.startsWith('./');
	const firstIsSlash = path.startsWith('/');
	const parts = removePrecedingAndTrailingSlash(path).split('/');
	if (depth === 0) {
		return '/';
	} else if (depth >= parts.length || (isRelative && depth === parts.length - 1)) {
		return path;
	} else {
		if(isRelative) {
			return `${parts.slice(0, depth+1).join('/')}/`;
		}
		const subPath = parts.slice(0, depth).join('/');
		return `${firstIsSlash ? '/' : ''}${subPath}/`;
	}
}


/**
 * Returns a list of unique paths with the given depth.
 * Relative paths without preceding slash will be treated as relatives (./).
 * To better compare preceding and trailing slashes are removed.
 * @param paths
 * @param depth
 * @returns
 */
export function getUniqSegmentsOfPath(paths: string[], depth: number): string[] {
	return Array.from(paths.reduce((acc, path) => {
		path = path.startsWith('./') ? path.slice(2) : path;
		const first = getSegmentsOfPath(path, depth);
		acc.add(removeTailingSlash(first));
		return acc;
	}, new Set<string>()));
}