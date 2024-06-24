import { vi, describe, test, expect } from "vitest";
import jsonConverter from "./json-converter.js";
import { LoomFile } from "@loom-io/core";

describe("json-converter", () => {
	test("verify", () => {
		const file = { extension: "json" } as LoomFile;
		expect(jsonConverter().verify(file)).toBe(true);
	});

	test.each(["yml", "yaml", "csv", "md", "xml", "xsd", "docx", "pdf"])(
		"verify with %s should false",
		(value) => {
			const file = { extension: value } as LoomFile;
			expect(jsonConverter().verify(file)).toBe(false);
		}
	);

	test("unify", async () => {
		const file = {
			write: vi.fn(),
		} as unknown as LoomFile;
		const content = { test: true };
		await jsonConverter().unify(file, content);
		expect(file.write).toHaveBeenCalledWith(JSON.stringify(content));
	});

	test("parse", async () => {
		const file = {
			text: vi.fn().mockReturnValue(Promise.resolve('{"test":true}')),
		} as unknown as LoomFile;
		const content = await jsonConverter().parse(file);
		expect(content).toEqual({ test: true });
	});
});
