


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

export function getSegmentsOfPath(path: string, depth: number): string {
	const firstIsSlash = path.startsWith('/');
	const lastIsSlash = path.endsWith('/');
	const parts = removePrecedingAndTrailingSlash(path).split('/');
	if (depth === 0) {
		return '/';
	} else if (depth >= parts.length) {
		return path;
	} else {
		const subPath = parts.slice(0, depth).join('/');
		return `${firstIsSlash ? '/' : ''}${subPath}${lastIsSlash ? '/' : ''}`;
	}
}

export function getUniqSegmentsOfPath(paths: string[], depth: number): string[] {
	return Array.from(paths.reduce((acc, path) => {
		const first = getSegmentsOfPath(path, depth);
		acc.add(first);
		return acc;
	}, new Set<string>()));
}