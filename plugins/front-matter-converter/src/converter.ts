import * as YAML from 'yaml';
import { PLUGIN_TYPE, type LoomFile, type LoomFileConverter } from '@loom-io/core';
import { LineResult } from '../../../packages/core/dist/helper/result';

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
		if(!(content.length === 0 && (lineContent === '---' || lineContent === ''))) {
			content.push(lineContent);
		}
		await line.next();
	} while(await line.hasNext());
	return content.join('\n');
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

export async function hasFrontMatter(line: LineResult) {
	const firstLine = await line.read('utf8');
	return firstLine.startsWith('---');
}

const prepareVerify = (config: Config = {}) => (file: LoomFile): boolean => {
	const { extensions = ['md'] } = config;
	for(const extension of extensions) {
		if(file.name.endsWith(extension)) {
			return true;
		}
	}
	return false;
};

const generateNone = (config: Config = {}) => {
	const configString = JSON.stringify(config);
	return Symbol.for(`front-matter-converter-${configString}`);
};

export async function writeToFile(file: LoomFile, matter: string = '', content: string = '') {
	const emptyLineBeforeContent = content.length === 0 ? '' : '\n';
	await file.write(`---\n${ensureNewLine(matter)}---\n${emptyLineBeforeContent}${content}`);
}

export async function stringifyJson(file: LoomFile, data: unknown): Promise<string> {
	if(data == null) {
		return '';
	}
	const reader = await file.reader();
	const lineReader = await reader.firstLine();
	if(lineReader && await hasFrontMatter(lineReader)) {
		const converter = await getFrontMatterConverter(lineReader);
		return converter.stringify(data);
	} else {
		return YAML.stringify(data);
	}
}

export function ensureNewLine(content: string | undefined) {
	if(content && content.length > 0 && content[content.length - 1] !== '\n') {
		return `${content}\n`;
	}
	return content;
}

async function stringify(file: LoomFile, content: unknown) {
	if(content == null) {
		await writeToFile(file);
		return;
	} else if(typeof content === 'string') {
		await writeToFile(file, undefined, content);
		return;
	} else if (typeof content === 'object') {
		if((Object.keys(content).length === 1 && ('data' in content || 'content' in content))
			|| (Object.keys(content).length === 2 && 'data' in content && 'content' in content)
		) {
			const dataString = 'data' in content ? await stringifyJson(file, content.data) : '';
			const contentString = 'content' in content ? String(content.content) : '';
			await writeToFile(file, dataString, contentString);
		} else {
			const dataString = await stringifyJson(file, content);
			await writeToFile(file, dataString);
		}
	}
}

async function parse(file: LoomFile): Promise<unknown> {
	const reader = await file.reader();
	const lineReader = await reader.firstLine();

	const result = {
		data: {} as unknown,
		content: ''
	};

	if(await hasFrontMatter(lineReader)) {
		lineReader.next();
		const frontMatter = await readFrontMatter(lineReader);
		const { parse } = await getFrontMatterConverter(lineReader);
		result.data = await parse(frontMatter);

		await lineReader.next();
	}

	result.content = await readContent(lineReader);

	return result;
}

export default (config?: Config) => ({
	$type: PLUGIN_TYPE.FILE_CONVERTER,
	nonce: generateNone(config),
	verify: prepareVerify(config),
	parse,
	stringify
}) satisfies LoomFileConverter;