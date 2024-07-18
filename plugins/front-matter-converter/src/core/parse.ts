import type { LineResult, LoomFile } from "@loom-io/core/internal";
import {
	getFrontMatterConverter,
	hasFrontMatter,
	type DataFormat,
} from "./utils.js";

export async function readFrontMatter(line: LineResult) {
	const frontMatter = [];
	let lineContent = await line.read("utf8");
	while (lineContent !== "---") {
		frontMatter.push(lineContent);
		await line.next();
		lineContent = await line.read("utf-8");
	}
	return frontMatter.join("\n");
}

export async function readContent(line: LineResult) {
	const content = [];
	do {
		const lineContent = await line.read("utf8");
		if (
			!(content.length === 0 && (lineContent === "---" || lineContent === ""))
		) {
			content.push(lineContent);
		}
		await line.next();
	} while (await line.hasNext());
	return content.join("\n");
}

export async function parse<T>(file: LoomFile): Promise<DataFormat<T | undefined>> {
	const reader = await file.reader();
	const lineReader = await reader.firstLine();

	const result = {
		data: {} as unknown,
		content: "",
	};

	if (await hasFrontMatter(lineReader)) {
		const { parse } = await getFrontMatterConverter(lineReader);
		await lineReader.next();
		const frontMatter = await readFrontMatter(lineReader);

		result.data = await parse(frontMatter);

		await lineReader.next();
	}

	result.content = await readContent(lineReader);

	return result as DataFormat<T>;
}
