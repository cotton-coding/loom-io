import { describe, test, expect } from "vitest";
import { FileMock } from "../test/mocks.js";
import { ensureNewLine, stringifyJson, writeToFile } from "./unify.js";
import { LoomFile } from "@loom-io/core";

describe("unify", () => {
	test("addNewLine adds new line", async () => {
		const testString = "test";
		expect(ensureNewLine(testString)).toBe("test\n");
	});

	test("addNewLine does not add new line if file already end with new line", async () => {
		const testString = "test\n";
		expect(ensureNewLine(testString)).toBe("test\n");
	});

	test("writeToFile writes content", async () => {
		const mockFile = new FileMock();
		const file = mockFile as unknown as LoomFile;
		const matter = "key: value";
		const content = "content with bla bal bla lines";
		await writeToFile(file, matter, content);
		expect(mockFile.lines).toEqual([
			"---",
			"key: value",
			"---",
			"",
			"content with bla bal bla lines",
		]);
	});

	test("writeToFile writes with empty data", async () => {
		const mockFile = new FileMock();
		const file = mockFile as unknown as LoomFile;
		const content = "#headline\ncontent with bla bal bla lines";
		await writeToFile(file, undefined, content);
		expect(mockFile.lines).toEqual([
			"---",
			"---",
			"",
			"#headline",
			"content with bla bal bla lines",
		]);
	});

	test("unifyJson returns empty string", async () => {
		const file = new FileMock() as unknown as LoomFile;
		const data1 = null;
		expect(stringifyJson(file, data1)).resolves.toBe("");
		const data2 = undefined;
		expect(stringifyJson(file, data2)).resolves.toBe("");
	});

	test("unifyJson returns yaml with newline", async () => {
		const file = new FileMock() as unknown as LoomFile;
		const data = { key: "value", some: "other" };
		console.log(await stringifyJson(file, data));
		expect(stringifyJson(file, data)).resolves.toBe(
			"key: value\nsome: other\n"
		);
	});

	test("unifyJson returns json with new line", async () => {
		const file = new FileMock(["---json", "---"]) as unknown as LoomFile;
		const data = { key: "value", some: "other" };
		expect(stringifyJson(file, data)).resolves.toBe(
			'{"key":"value","some":"other"}'
		);
	});
});
