import * as YAML from 'yaml';
import { PLUGIN_TYPE, type LoomFile, type LoomFileConverter } from '@loom-io/core';
import { LineResult } from '../../../packages/core/dist/helper/result';

const nonce = Symbol('yaml-converter');

type Config = {
	extensions?: string[];
}

export async function readFrontMatter(line: LineResult) {
	const frontMatter = [];
	let lineContent = await line.read('utf8');
	while(lineContent !== '---') {
		frontMatter.push(lineContent);
		await line.next();
		lineContent = await line.read('utf-8');
	}
	return frontMatter.join('\n');
}

export async function readContent(line: LineResult) {
	const content = [];
	do {
		const lineContent = await line.read('utf8');
		content.push(lineContent);
		await line.next();
	} while(await line.hasNext());
	return content.join('\n');
}

export async function getFrontMatterConverter<T>(firstLine: LineResult): Promise<{parse: (content: string) => T, stringify: (content: T) => string}>{
	const type = (await firstLine.read('utf8')).replace('---', '');

	if(['', 'yaml', 'yml'].includes(type)) {
		return YAML;
	} else if	(type === 'json') {
		return JSON;
	}

	throw new Error(`Unknown front matter type: ${type}`);
}

export async function hasFrontMatter(line: LineResult) {
	const firstLine = await line.read('utf8');
	return firstLine.startsWith('---');
}

const prepareVerify = (config: Config = {}) => (file: LoomFile): boolean => {
	const { extensions = ['md'] } = config;
	if(file.extension && extensions.includes(file.extension)) return true;
	return false;
};

async function stringify<T = unknown>(file: LoomFile, content: T) {
	const contentString = YAML.stringify(content);
	await file.write(contentString);
}

async function parse<T = unknown>(file: LoomFile): Promise<T> {
	const reader = await file.reader();
	const lineReader = await reader.firstLine();

	const result = {
		data: {} as unknown,
		content: ''
	};

	if(await hasFrontMatter(lineReader)) {
		lineReader.next();
		const frontMatter = await readFrontMatter(lineReader);
		const { parse } = await getFrontMatterConverter<T>(lineReader);
		result.data = await parse(frontMatter);

		await lineReader.next();
	}

	result.content = await readContent(lineReader);

	return result as T;
}

export default (config?: Config) => ({
	$type: PLUGIN_TYPE.FILE_CONVERTER,
	nonce,
	verify: prepareVerify(config),
	parse,
	stringify
}) satisfies LoomFileConverter;