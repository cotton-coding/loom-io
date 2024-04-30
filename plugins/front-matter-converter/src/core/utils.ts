import { LineResult } from '@loom-io/core/internal';
import * as YAML from 'yaml';


export async function hasFrontMatter(line: LineResult) {
	const firstLine = await line.read('utf8');
	return firstLine.startsWith('---');
}

export async function getFrontMatterConverter(firstLine: LineResult): Promise<{parse: (content: string) => unknown, stringify: (content: unknown) => string}>{
	const type = (await firstLine.read('utf8')).replace('---', '');

	if(['', 'yaml', 'yml'].includes(type)) {
		return YAML;
	} else if	(type === 'json') {
		return JSON;
	}

	throw new Error(`Unknown front matter type: ${type}`);
}