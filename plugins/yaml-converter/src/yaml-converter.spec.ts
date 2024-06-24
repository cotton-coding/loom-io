import { vi, describe, test, expect } from "vitest";
import yamlConverter from "./yaml-converter.js";
import { LoomFile } from "@loom-io/core";

describe("json-converter", () => {
	test.each(["yml", "yaml"])("verify with %s", (ext) => {
		const file = { extension: ext } as LoomFile;
		expect(yamlConverter().verify(file)).toBe(true);
	});

	test.each(["json", "csv", "md", "xml", "xsd", "docx", "pdf"])(
		"verify with %s should false",
		(value) => {
			const file = { extension: value } as LoomFile;
			expect(yamlConverter().verify(file)).toBe(false);
		}
	);

	test("unify", async () => {
		const file = {
			write: vi.fn(),
		} as unknown as LoomFile;
		const content = { test: true };
		await yamlConverter().unify(file, content);
		expect(file.write).toHaveBeenCalledWith("test: true\n");
	});

	test("parse", async () => {
		const file = {
			text: vi.fn().mockReturnValue(Promise.resolve("test: true\n")),
		} as unknown as LoomFile;
		const content = await yamlConverter().parse(file);
		expect(content).toEqual({ test: true });
	});
});
