import { describe, test, expect } from "vitest";
import { createCombinedConverter, CombinedConverter } from "./lib.js";

describe("Combined Converter", () => {
	test("Create Combined Converter", () => {
		const converter = createCombinedConverter([]);
		expect(converter).toBeInstanceOf(CombinedConverter);
	});

	test("Exports CombinedConverter", () => {
		expect(CombinedConverter).toBeDefined();
	});
});
