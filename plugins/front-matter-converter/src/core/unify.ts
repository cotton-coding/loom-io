import type { LoomFile } from "@loom-io/core";
import * as YAML from "yaml";
import {
	DataFormat,
	getFrontMatterConverter,
	hasFrontMatter,
} from "./utils.js";

export async function writeToFile(
	file: LoomFile,
	matter: string = "",
	content: string = ""
) {
	const emptyLineBeforeContent = content.length === 0 ? "" : "\n";
	await file.write(
		`---\n${ensureNewLine(matter)}---\n${emptyLineBeforeContent}${content}`
	);
}

export async function stringifyJson(
	file: LoomFile,
	data: unknown
): Promise<string> {
	if (data == null) {
		return "";
	}
	const reader = await file.reader();
	const lineReader = await reader.firstLine();
	if (lineReader && (await hasFrontMatter(lineReader))) {
		const converter = await getFrontMatterConverter(lineReader);
		return converter.stringify(data);
	} else {
		return YAML.stringify(data);
	}
}

export function ensureNewLine(content: string | undefined) {
	if (content && content.length > 0 && content[content.length - 1] !== "\n") {
		return `${content}\n`;
	}
	return content;
}

export async function unify<T>(
	file: LoomFile,
	content: Partial<DataFormat<T>> | string | null = null
) {
	if (content == null) {
		await writeToFile(file);
		return;
	} else if (typeof content === "string") {
		await writeToFile(file, undefined, content);
		return;
	} else if (typeof content === "object") {
		if (
			(Object.keys(content).length === 1 &&
				("data" in content || "content" in content)) ||
			(Object.keys(content).length === 2 &&
				"data" in content &&
				"content" in content)
		) {
			const dataString =
				"data" in content ? await stringifyJson(file, content.data) : "";
			const contentString = "content" in content ? String(content.content) : "";
			await writeToFile(file, dataString, contentString);
		} else {
			const dataString = await stringifyJson(file, content);
			await writeToFile(file, dataString);
		}
	}
}
